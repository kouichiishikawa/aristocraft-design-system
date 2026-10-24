'use client';

import { Button as BaseButton } from '@base-ui/react/button';
import type { LucideIcon } from 'lucide-react';
import { isValidElement, type ComponentProps } from 'react';
import { Icon } from '../Icon/Icon';
import { Spinner } from '../Spinner/Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'rounded' | 'pill';

export interface ButtonProps extends ComponentProps<typeof BaseButton> {
  /**
   * Visual emphasis. `default` = neutral fill, `primary` = brand fill (one per screen),
   * `secondary` = outlined, `tertiary` = text only, `danger` = destructive (error fill).
   */
  variant?: ButtonVariant;
  /** Control height: sm 32px, md 40px, lg 48px (dimension.size 800 / 1000 / 1200). */
  size?: ButtonSize;
  /** `rounded` = radius.200 (sm) / radius.300 (md, lg), squircle. `pill` = radius.full. */
  shape?: ButtonShape;
  /** Lucide icon before the label, e.g. `ArrowLeft`. 16px (sm, md) / 24px (lg). Prefer one side only. */
  iconBefore?: LucideIcon;
  /** Lucide icon after the label, e.g. `ArrowRight`. */
  iconAfter?: LucideIcon;
  /** Shows a Spinner in the iconBefore slot, sets aria-busy and blocks clicks while staying focusable. */
  loading?: boolean;
  /** Stretch to the width of the container. */
  fullWidth?: boolean;
}

/**
 * Button built on Base UI's accessible button primitive.
 * Render as a link with `render={<a href="…" />}`; state is exposed through data attributes.
 */
export function Button({
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  iconBefore,
  iconAfter,
  loading = false,
  fullWidth = false,
  disabled,
  focusableWhenDisabled,
  className,
  render,
  nativeButton,
  children,
  ...rest
}: ButtonProps) {
  const classes = className ? `${styles.button} ${className}` : styles.button;
  // Base UI needs to know when the rendered element is not a real <button> (e.g. render={<a />}).
  const isNative = nativeButton ?? (render == null || (isValidElement(render) && render.type === 'button'));
  // Icon and Spinner share the same steps: sm (16) for sm / md buttons, md (24) for lg.
  const glyphSize = size === 'lg' ? 'md' : 'sm';
  // Loading blocks clicks through Base UI's disabled handling but keeps focus (aria-disabled, no native disabled).
  const busy = loading && !disabled;
  return (
    <BaseButton
      className={classes}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-loading={loading || undefined}
      data-full-width={fullWidth || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      focusableWhenDisabled={busy || focusableWhenDisabled}
      render={render}
      nativeButton={isNative}
      {...rest}
    >
      {/* The label stays the accessible name; aria-busy carries the state, so the Spinner is hidden from AT. */}
      {loading ? (
        <Spinner size={glyphSize} className={styles.glyph} aria-hidden="true" />
      ) : (
        iconBefore && <Icon icon={iconBefore} size={glyphSize} className={styles.glyph} />
      )}
      {children}
      {iconAfter && <Icon icon={iconAfter} size={glyphSize} className={styles.glyph} />}
    </BaseButton>
  );
}
