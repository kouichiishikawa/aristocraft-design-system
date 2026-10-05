import type { ComponentProps, CSSProperties } from 'react';
import styles from './Spinner.module.css';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** 12 / 16 / 24 / 32 / 48 px (dimension.size 300 / 400 / 600 / 800 / 1200), the same steps as Icon. Default md = 24. */
  size?: SpinnerSize;
  /** Accessible name announced for the status region. */
  label?: string;
}

const DOTS = [0, 1, 2, 3, 4, 5, 6, 7];

/**
 * Loading indicator: 8 dots on a ring, a pulse travelling around once per second
 * (loading-ui "dots-ring", MIT). Colour is `currentColor`, so it takes the text colour of
 * its parent (e.g. a Button label). Matches the Figma "Spinner" component set.
 */
export function Spinner({ size = 'md', label = 'Loading', className, ...rest }: SpinnerProps) {
  const classes = className ? `${styles.spinner} ${className}` : styles.spinner;
  return (
    <span role="status" aria-label={label} className={classes} data-size={size} {...rest}>
      {DOTS.map((i) => (
        <span key={i} aria-hidden="true" className={styles.dot} style={{ '--i': i } as CSSProperties} />
      ))}
    </span>
  );
}
