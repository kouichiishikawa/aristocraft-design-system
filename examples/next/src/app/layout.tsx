import type { Metadata } from 'next';
import type { ReactNode } from 'react';
// Two stylesheets, once, in the root layout: tokens (CSS variables, light/dark) then component styles.
import '@aristocraft/tokens/css';
import '@aristocraft/ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'aristocraft ui × Next.js',
  description: 'Thin sample: @aristocraft/ui consumed from a Next.js App Router site',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
