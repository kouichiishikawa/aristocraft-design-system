import { Button } from '@aristocraft/ui';
import { ThemeToggle } from './theme-toggle';

// Server Component: Button is a client component inside @aristocraft/ui ('use client' in its bundle),
// so it can be used here without any wrapper.
export default function Home() {
  return (
    <main className="page">
      <h1 className="title">aristocraft ui × Next.js 16</h1>
      <p className="lead">Button from @aristocraft/ui, colours and spacing from @aristocraft/tokens.</p>
      <div className="row">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button render={<a href="#contact" />}>Contact</Button>
      </div>
      <div className="row">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
      </div>
      <ThemeToggle />
    </main>
  );
}
