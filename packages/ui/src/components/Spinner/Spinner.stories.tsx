import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Spinner } from './Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  args: { size: 'md' },
  argTypes: { size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] } },
  parameters: {
    docs: {
      description: {
        component:
          'loading-ui の dots-ring（MIT）を Icon と同じ 5 段（12 / 16 / 24 / 32 / 48px）で描く。8 点の輪を 1 秒で脈が一周する。色は currentColor。role="status" と label で読み上げ。Figma の Spinner セットに対応。',
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status', { name: 'Loading' });
    await expect(status.querySelectorAll('[aria-hidden="true"]')).toHaveLength(8);
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--ac-dimension-space-400)', alignItems: 'center', color: 'var(--ac-color-icon-default)' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => <Spinner key={size} {...args} size={size} />)}
    </div>
  ),
};

/** Inherits the parent's text colour, e.g. inside a brand-coloured label. */
export const Coloured: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--ac-dimension-space-400)', alignItems: 'center' }}>
      <span style={{ color: 'var(--ac-color-text-brand)' }}><Spinner {...args} /></span>
      <span style={{ color: 'var(--ac-color-text-subtlest)' }}><Spinner {...args} /></span>
      <span style={{ color: 'var(--ac-color-text-status-error)' }}><Spinner {...args} /></span>
    </div>
  ),
};
