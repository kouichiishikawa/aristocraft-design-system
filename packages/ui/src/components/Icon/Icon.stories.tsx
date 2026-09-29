import type { Meta, StoryObj } from '@storybook/react-vite';
import * as lucide from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { expect, within } from 'storybook/test';
import manifest from '../../../icons.json';
import { BrandIcon, brands } from './BrandIcon';
import { Icon } from './Icon';

const pascal = (kebab: string) => kebab.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
const glyph = (name: string) => (lucide as unknown as Record<string, LucideIcon>)[pascal(name)];

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: { icon: lucide.ArrowRight, size: 'md' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg', 'xl'] }, icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'Lucide を dimension.size 300〜600（12 / 16 / 20 / 24px）で描く。色は currentColor。ブランドロゴは Simple Icons の BrandIcon。採用一覧は packages/ui/icons.json、Figma の icon/* と brand/* に対応。',
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--ac-dimension-space-400)', alignItems: 'center', color: 'var(--ac-color-icon-default)' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => <Icon key={size} {...args} size={size} />)}
    </div>
  ),
};

export const Labelled: Story = {
  args: { icon: lucide.Mail, label: 'メール' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'メール' })).toBeVisible();
  },
};

/** Every icon in icons.json, grouped. All must resolve to a lucide-react export. */
export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ac-dimension-space-600)', color: 'var(--ac-color-icon-default)' }}>
      {Object.entries(manifest.lucide.groups).map(([group, names]) => (
        <section key={group}>
          <h3 style={{ margin: '0 0 var(--ac-dimension-space-200)', font: 'var(--ac-font-label-sm-font-weight) var(--ac-font-label-sm-font-size)/var(--ac-font-label-sm-line-height) var(--ac-font-label-sm-font-family)', color: 'var(--ac-color-text-subtle)' }}>{group}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ac-dimension-space-400)' }}>
            {names.map((name) => <Icon key={name} icon={glyph(name)} size="xl" label={name} />)}
          </div>
        </section>
      ))}
      <section>
        <h3 style={{ margin: '0 0 var(--ac-dimension-space-200)', color: 'var(--ac-color-text-subtle)' }}>brand</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ac-dimension-space-400)' }}>
          {(Object.keys(brands) as (keyof typeof brands)[]).map((b) => <BrandIcon key={b} brand={b} size="xl" />)}
        </div>
      </section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const all = Object.values(manifest.lucide.groups).flat();
    for (const name of all) await expect(glyph(name), `lucide-react has no export for ${name}`).toBeDefined();
    await expect(within(canvasElement).getAllByRole('img')).toHaveLength(all.length + Object.keys(brands).length);
  },
};
