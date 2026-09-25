import { spawn } from 'node:child_process';

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
 * Videos: dimensions and duration from ffprobe, a thumbnail from one frame via ffmpeg. Both read
 * the file from a signed URL, so a 1 GB video never has to fit in memory.
 */
export async function analyzeVideo(
  url: string,
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
      url,
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
      url,
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
