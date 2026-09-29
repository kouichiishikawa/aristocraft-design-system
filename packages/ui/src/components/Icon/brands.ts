import {
  siApplemusic, siBandcamp, siGithub, siInstagram, siNote, siSoundcloud, siSpotify, siX, siYoutube,
} from 'simple-icons';
import linkedin from '../../../icons/brand/linkedin.json';

export interface BrandGlyph {
  title: string;
  hex: string;
  /** Path data on a 0 0 24 24 box (Simple Icons convention). */
  path: string;
  /** Optional SVG transform for glyphs that were not drawn on the 24 box. */
  transform?: string;
}

const si = ({ title, hex, path }: { title: string; hex: string; path: string }): BrandGlyph => ({ title, hex, path });

/** Brand logos: Simple Icons (CC0) plus the exceptions documented in icons/brand/*.json. Same names as Figma `brand/*`. */
export const brands = {
  github: si(siGithub),
  x: si(siX),
  instagram: si(siInstagram),
  youtube: si(siYoutube),
  linkedin: { title: linkedin.title, hex: linkedin.hex, path: linkedin.path, transform: linkedin.transform } as BrandGlyph,
  spotify: si(siSpotify),
  soundcloud: si(siSoundcloud),
  applemusic: si(siApplemusic),
  bandcamp: si(siBandcamp),
  note: si(siNote),
} as const satisfies Record<string, BrandGlyph>;

export type BrandName = keyof typeof brands;

/**
 * Brand glyphs are drawn edge to edge on the 24 box while Lucide keeps ~2px of air, so the logo is
 * shown at 20/24 (viewBox padding of 2.4 on each side) to sit optically with the Lucide set.
 */
export const BRAND_VIEWBOX = '-2.4 -2.4 28.8 28.8';
