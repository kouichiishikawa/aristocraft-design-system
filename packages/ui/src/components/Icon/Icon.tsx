import type { LucideIcon, LucideProps } from 'lucide-react';
import styles from './Icon.module.css';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconProps extends Omit<LucideProps, 'size' | 'ref'> {
  /** Any icon from `lucide-react`, e.g. `ArrowRight`. The curated set is listed in icons.json. */
  icon: LucideIcon;
  /** 12 / 16 / 24 / 32 / 48 px (dimension.size 300 / 400 / 600 / 800 / 1200). Default md = 24 (Lucide's native size). */
  size?: IconSize;
  /** Accessible name. Omit for decorative icons (they get aria-hidden). */
  label?: string;
}

/**
 * Lucide icon at a token size. Colour is `currentColor`: set `color: var(--ac-color-icon-*)` on the parent
 * or pass `className`. Stroke width scales with size (Lucide default), matching the Figma "Icon" component.
 */
export function Icon({ icon: Glyph, size = 'md', label, className, ...rest }: IconProps) {
  const classes = className ? `${styles.icon} ${className}` : styles.icon;
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  return <Glyph className={classes} data-size={size} focusable="false" {...a11y} {...rest} />;
}
