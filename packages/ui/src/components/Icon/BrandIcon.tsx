import {
  siApplemusic, siBandcamp, siGithub, siInstagram, siNote, siSoundcloud, siSpotify, siX, siYoutube,
} from 'simple-icons';
import type { SVGProps } from 'react';
import type { IconSize } from './Icon';
import styles from './Icon.module.css';

/** Brand logos come from Simple Icons (CC0); Lucide deliberately ships none. Same names as the Figma `brand/*` components. */
export const brands = {
  github: siGithub,
  x: siX,
  instagram: siInstagram,
  youtube: siYoutube,
  spotify: siSpotify,
  soundcloud: siSoundcloud,
  applemusic: siApplemusic,
  bandcamp: siBandcamp,
  note: siNote,
} as const;

export type BrandName = keyof typeof brands;

export interface BrandIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  brand: BrandName;
  size?: IconSize;
  /** Accessible name. Defaults to the brand title; pass an empty string for decorative use. */
  label?: string;
}

/** Filled logo at a token size, `currentColor` (use the brand colour only where the brand's guidelines require it). */
export function BrandIcon({ brand, size = 'md', label, className, ...rest }: BrandIconProps) {
  const icon = brands[brand];
  const name = label ?? icon.title;
  const classes = className ? `${styles.icon} ${className}` : styles.icon;
  const a11y = name ? { role: 'img', 'aria-label': name } : { 'aria-hidden': true };
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={classes} data-size={size} focusable="false" {...a11y} {...rest}>
      <path d={icon.path} />
    </svg>
  );
}
