import type { SVGProps } from 'react';
import { BRAND_VIEWBOX, brands, type BrandName } from './brands';
import type { IconSize } from './Icon';
import styles from './Icon.module.css';

export { brands, type BrandName } from './brands';

export interface BrandIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  brand: BrandName;
  size?: IconSize;
  /** Accessible name. Defaults to the brand title; pass an empty string for decorative use. */
  label?: string;
}

/** Filled logo at a token size, `currentColor`, optically matched to Lucide (20/24 of the box). */
export function BrandIcon({ brand, size = 'md', label, className, ...rest }: BrandIconProps) {
  const icon = brands[brand];
  const name = label ?? icon.title;
  const classes = className ? `${styles.icon} ${className}` : styles.icon;
  const a11y = name ? { role: 'img', 'aria-label': name } : { 'aria-hidden': true };
  return (
    <svg viewBox={BRAND_VIEWBOX} fill="currentColor" className={classes} data-size={size} focusable="false" {...a11y} {...rest}>
      <path d={icon.path} transform={icon.transform} />
    </svg>
  );
}
