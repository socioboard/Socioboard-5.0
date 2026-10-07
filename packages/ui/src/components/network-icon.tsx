import type { NetworkId } from '@socioboard/contracts';
import {
  siFacebook,
  siInstagram,
  siPinterest,
  siSnapchat,
  siThreads,
  siTiktok,
  siTumblr,
  siX,
  siYoutube,
  type SimpleIcon,
} from 'simple-icons';

import { cn } from '../cn';

interface Brand {
  name: string;
  /** Simple Icons glyph (CC0); LinkedIn isn't there, so it gets a plain mark until phase 3. */
  icon: SimpleIcon | null;
  /** Tile fill. */
  tile: string;
  /** Glyph colour on the tile. */
  onTile: string;
  /**
   * Bare glyph colour: the brand colour only where it reads on glass in both themes; black and
   * very light brands follow the ink colour instead.
   */
  glyph: string;
}

const BRANDS: Record<NetworkId, Brand> = {
  facebook_page: {
    name: 'Facebook',
    icon: siFacebook,
    tile: 'bg-[#0866FF]',
    onTile: 'text-white',
    glyph: 'text-[#0866FF] dark:text-[#4C8DFF]',
  },
  instagram: {
    name: 'Instagram',
    icon: siInstagram,
    tile: 'bg-[linear-gradient(45deg,#FEDA75,#FA7E1E_25%,#D62976_50%,#962FBF_75%,#4F5BD5)]',
    onTile: 'text-white',
    glyph: 'text-[#E1306C] dark:text-[#FF5C8A]',
  },
  linkedin_person: {
    name: 'LinkedIn',
    icon: null,
    tile: 'bg-[#0A66C2]',
    onTile: 'text-white',
    glyph: 'text-[#0A66C2] dark:text-[#5AA2F0]',
  },
  linkedin_org: {
    name: 'LinkedIn',
    icon: null,
    tile: 'bg-[#0A66C2]',
    onTile: 'text-white',
    glyph: 'text-[#0A66C2] dark:text-[#5AA2F0]',
  },
  x: {
    name: 'X',
    icon: siX,
    tile: 'bg-black ring-1 ring-white/15',
    onTile: 'text-white',
    glyph: 'text-ink',
  },
  youtube: {
    name: 'YouTube',
    icon: siYoutube,
    tile: 'bg-[#FF0000]',
    onTile: 'text-white',
    glyph: 'text-[#E00000] dark:text-[#FF4D4D]',
  },
  pinterest: {
    name: 'Pinterest',
    icon: siPinterest,
    tile: 'bg-[#BD081C]',
    onTile: 'text-white',
    glyph: 'text-[#BD081C] dark:text-[#F0485A]',
  },
  tiktok: {
    name: 'TikTok',
    icon: siTiktok,
    tile: 'bg-black ring-1 ring-white/15',
    onTile: 'text-white',
    glyph: 'text-ink',
  },
  snapchat: {
    name: 'Snapchat',
    icon: siSnapchat,
    tile: 'bg-[#FFFC00]',
    onTile: 'text-black',
    glyph: 'text-ink',
  },
  tumblr: {
    name: 'Tumblr',
    icon: siTumblr,
    tile: 'bg-[#36465D]',
    onTile: 'text-white',
    glyph: 'text-ink',
  },
  threads: {
    name: 'Threads',
    icon: siThreads,
    tile: 'bg-black ring-1 ring-white/15',
    onTile: 'text-white',
    glyph: 'text-ink',
  },
};

/** The network's name as people know it (LinkedIn profiles and pages are both "LinkedIn"). */
export function networkName(network: NetworkId): string {
  return BRANDS[network].name;
}

const sizes = {
  xs: { box: 'size-4', glyph: 'size-2.5', bare: 'size-3.5', mark: 'text-[7px]' },
  sm: { box: 'size-5', glyph: 'size-3', bare: 'size-4', mark: 'text-[8px]' },
  md: { box: 'size-7', glyph: 'size-4', bare: 'size-5', mark: 'text-[11px]' },
  lg: { box: 'size-10', glyph: 'size-6', bare: 'size-7', mark: 'text-[16px]' },
} as const;

export interface NetworkIconProps {
  network: NetworkId;
  size?: keyof typeof sizes;
  /** `tile`: the glyph on the brand colour (pickers, avatars); `glyph`: the bare mark (text lines). */
  variant?: 'glyph' | 'tile';
  /** Hide from screen readers when the network's name is already written next to it. */
  decorative?: boolean;
  className?: string;
}

/** A network's mark, the same everywhere: pickers, previews, calendar cards. */
export function NetworkIcon({
  network,
  size = 'sm',
  variant = 'glyph',
  decorative = false,
  className,
}: NetworkIconProps) {
  const brand = BRANDS[network];
  const s = sizes[size];
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': brand.name };
  const mark = brand.icon ? (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={variant === 'tile' ? s.glyph : s.bare}
    >
      <path d={brand.icon.path} />
    </svg>
  ) : (
    <span aria-hidden="true" className={cn('leading-none font-bold tracking-tight', s.mark)}>
      in
    </span>
  );
  // A bare LinkedIn mark is its letters on a small square, like the real one.
  if (variant === 'glyph' && !brand.icon) {
    return (
      <span
        {...a11y}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-[22%] bg-[#0A66C2] text-white dark:bg-[#3D8BD9]',
          s.bare,
          className,
        )}
      >
        {mark}
      </span>
    );
  }
  if (variant === 'glyph') {
    return (
      <span
        {...a11y}
        className={cn('inline-flex shrink-0 items-center justify-center', brand.glyph, className)}
      >
        {mark}
      </span>
    );
  }
  return (
    <span
      {...a11y}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[28%]',
        s.box,
        brand.tile,
        brand.onTile,
        className,
      )}
    >
      {mark}
    </span>
  );
}
