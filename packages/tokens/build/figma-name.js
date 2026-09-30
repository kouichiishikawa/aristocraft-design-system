// Figma display names: Title Case with spaces (decision 2026-09-30). Tokens, CSS and code stay lowercase.
//   color.text.brand        → Color/Text/Brand
//   typography.lineHeight.md → Typography/Line Height/MD   (size abbreviations upper-case)
//   icon arrow-right         → Icon/Arrow Right
//   brand github             → Brand/GitHub                (official brand spelling)
// Component property values are spelled out instead (Small / Medium / Large / Extra Large), see SIZE_WORDS.

const ABBREVIATIONS = new Set(['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl']);
export const SIZE_WORDS = { xs: 'Extra Small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra Large', xxl: '2X Large', xxxl: '3X Large' };
export const BRAND_TITLES = {
  github: 'GitHub', x: 'X', instagram: 'Instagram', youtube: 'YouTube', linkedin: 'LinkedIn', spotify: 'Spotify',
  soundcloud: 'SoundCloud', applemusic: 'Apple Music', bandcamp: 'Bandcamp', note: 'Note',
};

const cap = (w) => (w ? w[0].toUpperCase() + w.slice(1) : w);

/** One path segment → display segment. */
export function figmaSegment(seg) {
  if (ABBREVIATIONS.has(seg)) return seg.toUpperCase();
  if (/^\d/.test(seg)) return seg; // 050, 100a, 2
  const layer = seg.match(/^layer(\d+)$/);
  if (layer) return `Layer ${layer[1]}`;
  return seg
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camelCase → words
    .split(/[-\s]+/) // kebab / spaces
    .map(cap)
    .join(' ');
}

/** Token path (array or dotted string, `$root` already removed) → Figma name. */
export const figmaName = (path) => (Array.isArray(path) ? path : path.split('.')).map(figmaSegment).join('/');

/** Icon component names on the Icons page. */
export const iconComponentName = (name) => `Icon/${figmaSegment(name)}`;
export const brandComponentName = (name) => `Brand/${BRAND_TITLES[name] ?? figmaSegment(name)}`;

/** Figma name → CSS custom property (inverse for the WEB code syntax). */
export const cssFromFigmaName = (name, prefix = 'ac') =>
  `var(--${prefix}-${name.split('/').map((s) => s.replace(/\s+/g, '-').toLowerCase()).join('-')})`;
