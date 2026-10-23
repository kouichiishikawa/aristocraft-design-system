import { Button } from '@aristocraft/ui';

// Flips data-theme on <html>; tokens.css switches every --ac-color-* variable.
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  };
  return (
    <Button variant="default" size="sm" onClick={toggle}>
      Toggle light / dark
    </Button>
  );
}
