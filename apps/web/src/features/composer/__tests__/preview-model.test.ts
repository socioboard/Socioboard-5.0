import { describe, expect, it } from 'vitest';

import {
  croppedRatio,
  gridLayout,
  instagramFrameRatio,
  linkHost,
  textParts,
  truncateText,
} from '../previews/model';

const IG_CROP = { min: 0.8, max: 1.91 };

describe('truncateText', () => {
  it('leaves text that fits, and has no limit when the network shows everything', () => {
    expect(truncateText('short', 125)).toEqual({ shown: 'short', truncated: false });
    expect(truncateText('x'.repeat(5000), null)).toEqual({
      shown: 'x'.repeat(5000),
      truncated: false,
    });
  });

  it('counts as networks do: an emoji is one character', () => {
    // 🌱 takes two UTF-16 units, as most emoji do; networks count it once.
    const text = '🌱'.repeat(10);
    expect(truncateText(text, 10).truncated).toBe(false);
    expect(truncateText(`${text}!`, 10)).toEqual({ shown: text, truncated: true });
  });

  it('cuts between words when a word straddles the limit, and drops trailing spaces', () => {
    expect(truncateText('Fresh roast today at the bar', 14)).toEqual({
      shown: 'Fresh roast',
      truncated: true,
    });
    // One long word: cut where the limit falls.
    expect(truncateText('a'.repeat(40), 30)).toEqual({ shown: 'a'.repeat(30), truncated: true });
  });
});

describe('truncateText by lines', () => {
  it('a caption of short lines is cut after the network’s line limit too', () => {
    expect(truncateText('One\nTwo\nThree', 125, 2)).toEqual({ shown: 'One\nTwo', truncated: true });
    expect(truncateText('One\nTwo', 125, 2)).toEqual({ shown: 'One\nTwo', truncated: false });
    // Lines kept, then still cut by characters.
    expect(truncateText(`${'word '.repeat(40)}\nnext`, 50, 5).shown.length).toBeLessThanOrEqual(50);
    expect(truncateText('One\nTwo\nThree', 125, null).truncated).toBe(false);
  });
});

describe('shapes', () => {
  it('keeps a file within the network’s crop limits', () => {
    expect(croppedRatio(9 / 16, IG_CROP)).toBe(0.8);
    expect(croppedRatio(3, IG_CROP)).toBe(1.91);
    expect(croppedRatio(1.5, IG_CROP)).toBe(1.5);
    expect(croppedRatio(0.3, null)).toBe(0.3);
  });

  it('Instagram frames a feed post by its first file; reels and stories are 9:16', () => {
    const tall = { width: 1080, height: 1920 };
    const wide = { width: 1600, height: 900 };
    expect(instagramFrameRatio('feed', tall, IG_CROP)).toBe(0.8);
    expect(instagramFrameRatio('feed', wide, IG_CROP)).toBeCloseTo(1600 / 900);
    expect(instagramFrameRatio('feed', undefined, IG_CROP)).toBe(1);
    expect(instagramFrameRatio('reel', wide, IG_CROP)).toBe(9 / 16);
    expect(instagramFrameRatio('story', wide, IG_CROP)).toBe(9 / 16);
  });

  it('Facebook’s grid: one, a pair, one above two, then 2 × 2 with the rest counted', () => {
    expect(gridLayout(1)).toEqual({ shown: 1, more: 0, arrangement: 'single' });
    expect(gridLayout(2)).toEqual({ shown: 2, more: 0, arrangement: 'pair' });
    expect(gridLayout(3)).toEqual({ shown: 3, more: 0, arrangement: 'hero' });
    expect(gridLayout(4)).toEqual({ shown: 4, more: 0, arrangement: 'quad' });
    expect(gridLayout(7)).toEqual({ shown: 4, more: 3, arrangement: 'quad' });
  });
});

describe('text', () => {
  it('finds hashtags, mentions and web addresses (any language), and leaves the rest as text', () => {
    expect(textParts('Café #kaffee @halden.roasters see https://halden.coffee/guji!')).toEqual([
      { kind: 'text', value: 'Café ' },
      { kind: 'hashtag', value: '#kaffee' },
      { kind: 'text', value: ' ' },
      { kind: 'mention', value: '@halden.roasters' },
      { kind: 'text', value: ' see ' },
      { kind: 'link', value: 'https://halden.coffee/guji!' },
    ]);
    expect(textParts('#コーヒー')).toEqual([{ kind: 'hashtag', value: '#コーヒー' }]);
  });

  it('a link card names the site without www', () => {
    expect(linkHost('https://www.halden.coffee/beans')).toBe('halden.coffee');
    expect(linkHost('not a link')).toBeNull();
  });
});
