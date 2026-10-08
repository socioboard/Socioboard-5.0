import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import sharp from 'sharp';

/** What processing learns about a file; the thumbnail is a WebP. */
export interface MediaInfo {
  width: number | null;
  height: number | null;
  durationSec: number | null;
  thumbnail: Buffer | null;
}

const THUMB_SIZE = 480;

const toThumbnail = (input: Buffer) =>
  sharp(input, { animated: false })
    .rotate() // apply EXIF orientation, so phone photos aren't sideways
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

/** Images and GIFs: dimensions as displayed (EXIF rotation applied) and a thumbnail. */
export async function analyzeImage(bytes: Buffer): Promise<MediaInfo> {
  // autoOrient: dimensions after applying EXIF rotation, i.e. as the image is displayed.
  const { autoOrient } = await sharp(bytes, { animated: false }).metadata();
  return {
    width: autoOrient.width,
    height: autoOrient.height,
    durationSec: null,
    thumbnail: await toThumbnail(bytes),
  };
}

/** Runs a program and collects stdout; rejects on a non-zero exit or when it can't start. */
function run(program: string, args: string[], timeoutMs = 60_000): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const out: Buffer[] = [];
    let err = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`${program} timed out`));
    }, timeoutMs);
    child.stdout.on('data', (chunk: Buffer) => out.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => {
      err += chunk.toString();
    });
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(Buffer.concat(out));
      else reject(new Error(`${program} exited with ${String(code)}: ${err.slice(-500)}`));
    });
  });
}

export class ToolMissingError extends Error {
  constructor(tool: string) {
    super(`${tool} is not installed or not on PATH`);
    this.name = 'ToolMissingError';
  }
}

interface ProbeOutput {
  streams?: {
    codec_type?: string;
    width?: number;
    height?: number;
    tags?: { rotate?: string };
    side_data_list?: { rotation?: number }[];
  }[];
  format?: { duration?: string };
}

/**
 * Copies a stored file to a temporary local file for `use`, then removes it. ffmpeg and ffprobe
 * read the copy rather than the URL: static builds (the usual way to get them without root, as on
 * staging) crash on any network address, since a static program can't look up host names; every
 * video on staging failed that way until 2026-10-08. The copy is streamed, so a 1 GB video never
 * has to fit in memory, and refused past `maxBytes`.
 */
export async function withLocalCopy<T>(
  url: string,
  maxBytes: number,
  use: (path: string) => Promise<T>,
): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), 'sb-media-'));
  try {
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      throw new Error(`Reading the stored file failed: HTTP ${String(res.status)}`);
    }
    let size = 0;
    const capped = new Transform({
      transform(chunk: Buffer, _encoding, done) {
        size += chunk.length;
        if (size > maxBytes) done(new Error(`The stored file is over ${String(maxBytes)} bytes`));
        else done(null, chunk);
      },
    });
    const path = join(dir, 'source');
    await pipeline(Readable.fromWeb(res.body), capped, createWriteStream(path));
    return await use(path);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Videos: dimensions and duration from ffprobe, a thumbnail from one frame via ffmpeg, read from
 * `source` (a local file: see withLocalCopy).
 */
export async function analyzeVideo(
  source: string,
  tools: { ffmpegPath: string; ffprobePath: string },
): Promise<MediaInfo> {
  let probe: ProbeOutput;
  try {
    const out = await run(tools.ffprobePath, [
      '-v',
      'error',
      '-print_format',
      'json',
      '-show_streams',
      '-show_format',
      source,
    ]);
    probe = JSON.parse(out.toString()) as ProbeOutput;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') throw new ToolMissingError('ffprobe');
    throw err;
  }
  const video = probe.streams?.find((s) => s.codec_type === 'video');
  const rotation = Math.abs(
    Number(
      video?.tags?.rotate ??
        video?.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ??
        0,
    ),
  );
  const swap = rotation === 90 || rotation === 270;
  const duration = Number(probe.format?.duration);

  let thumbnail: Buffer | null = null;
  try {
    // A frame one second in (or the first frame of very short clips), as JPEG on stdout.
    const seek = Number.isFinite(duration) && duration > 2 ? '1' : '0';
    const frame = await run(tools.ffmpegPath, [
      '-v',
      'error',
      '-ss',
      seek,
      '-i',
      source,
      '-frames:v',
      '1',
      '-f',
      'image2pipe',
      '-vcodec',
      'mjpeg',
      'pipe:1',
    ]);
    thumbnail = await toThumbnail(frame);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    // ffprobe present but not ffmpeg: keep the metadata, skip the thumbnail.
  }

  return {
    width: (swap ? video?.height : video?.width) ?? null,
    height: (swap ? video?.width : video?.height) ?? null,
    durationSec: Number.isFinite(duration) ? Math.round(duration * 100) / 100 : null,
    thumbnail,
  };
}
