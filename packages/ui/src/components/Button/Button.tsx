'use client';

import { Button as BaseButton } from '@base-ui/react/button';
import { isValidElement, type ComponentProps } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentProps<typeof BaseButton> {
  /** Visual emphasis. `primary` = brand fill, `secondary` = neutral fill, `ghost` = text only. */
  variant?: ButtonVariant;
  /** Control height: sm 32px, md 40px, lg 48px (dimension.size 800 / 1000 / 1200). */
  size?: ButtonSize;
}

/**
 * Button built on Base UI's accessible button primitive.
 * Render as a link with `render={<a href="…" />}`; state is exposed through data attributes.
 */
export function Button({ variant = 'primary', size = 'md', className, render, nativeButton, ...rest }: ButtonProps) {
  const classes = className ? `${styles.button} ${className}` : styles.button;
  // Base UI needs to know when the rendered element is not a real <button> (e.g. render={<a />}).
  const isNative = nativeButton ?? (render == null || (isValidElement(render) && render.type === 'button'));
  return (
    <BaseButton className={classes} data-variant={variant} data-size={size} render={render} nativeButton={isNative} {...rest} />
  );
}
