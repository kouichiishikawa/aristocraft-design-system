'use client';

import { Button } from '@aristocraft/ui';

// Flips data-theme on <html>; tokens.css switches every --ac-color-* variable.
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
  };
  return (
    <Button variant="secondary" size="sm" onClick={toggle}>
      Toggle light / dark
    </Button>
  );
}
