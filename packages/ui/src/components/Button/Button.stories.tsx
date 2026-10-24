import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const row = { display: 'flex', gap: 'var(--ac-dimension-space-400)', alignItems: 'center' } as const;

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Get in touch', onClick: fn() },
  argTypes: {
    variant: { control: 'radio', options: ['default', 'primary', 'secondary', 'tertiary', 'danger'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    shape: { control: 'radio', options: ['rounded', 'pill'] },
    iconBefore: { control: false },
    iconAfter: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Base UI の Button に CSS Modules で @aristocraft/tokens を当てた部品。色は color.background.neutral / brand / status.error、寸法は dimension.size と space、文字は font.label。',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Get in touch' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Primary: Story = { args: { variant: 'primary' } };

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Tertiary: Story = { args: { variant: 'tertiary' } };

export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } };

export const Variants: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="default">Default</Button>
      <Button {...args} variant="primary">Primary</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="tertiary">Tertiary</Button>
      <Button {...args} variant="danger">Danger</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toBeDisabled();
  },
};

/** Rendered as <a>: Base UI keeps button semantics (role="button", keyboard) while the element navigates. */
export const AsLink: Story = {
  args: { render: <a href="#contact" />, children: 'Contact' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Contact' });
    await expect(button.tagName).toBe('A');
    await expect(button).toHaveAttribute('href', '#contact');
  },
};

/** rounded: sm radius.200 (8) / md・lg radius.300 (12), squircle. pill: radius.full. */
export const Shapes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ac-dimension-space-400)' }}>
      {(['rounded', 'pill'] as const).map((shape) => (
        <div key={shape} style={row}>
          <Button {...args} shape={shape} size="sm">Small</Button>
          <Button {...args} shape={shape} size="md">Medium</Button>
          <Button {...args} shape={shape} size="lg">Large</Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [sm, md, lg, pillSm] = within(canvasElement).getAllByRole('button');
    await expect(getComputedStyle(sm!).borderTopLeftRadius).toBe('8px');
    await expect(getComputedStyle(md!).borderTopLeftRadius).toBe('12px');
    await expect(getComputedStyle(lg!).borderTopLeftRadius).toBe('12px');
    await expect(getComputedStyle(pillSm!).borderTopLeftRadius).toBe('9999px');
  },
};

export const Pill: Story = { args: { shape: 'pill', variant: 'primary' } };

/** Icons are 16px for sm / md and 24px for lg; icon.inverse on primary / danger, icon.default elsewhere. */
export const WithIcons: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ac-dimension-space-400)' }}>
      {(['default', 'primary', 'secondary', 'tertiary', 'danger'] as const).map((variant) => (
        <div key={variant} style={row}>
          <Button {...args} variant={variant} size="sm" iconBefore={Plus}>Add</Button>
          <Button {...args} variant={variant} size="md" iconBefore={ArrowLeft}>Back</Button>
          <Button {...args} variant={variant} size="lg" iconAfter={ArrowRight}>Next</Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const back = within(canvasElement).getAllByRole('button', { name: 'Back' })[0]!;
    // Decorative: the label alone is the accessible name.
    await expect(back.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  },
};

/** The Spinner takes the iconBefore slot (Figma: width grows by icon + gap when there is no iconBefore). */
export const Loading: Story = {
  args: { loading: true, variant: 'primary', children: 'Saving' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Saving' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).not.toBeDisabled(); // stays focusable
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    button.focus();
    await expect(button).toHaveFocus();
    // Surface opacity is unchanged while loading (only explicit disabled dims).
    await expect(getComputedStyle(button).opacity).toBe('1');
  },
};

export const LoadingStates: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ac-dimension-space-400)' }}>
      {(['default', 'primary', 'secondary', 'tertiary', 'danger'] as const).map((variant) => (
        <div key={variant} style={row}>
          <Button {...args} variant={variant} size="sm" loading>Saving</Button>
          <Button {...args} variant={variant} size="md" loading iconBefore={Plus}>Saving</Button>
          <Button {...args} variant={variant} size="lg" loading>Saving</Button>
        </div>
      ))}
      <div style={row} data-testid="growth">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <span key={size} style={row}>
            <Button {...args} variant="default" size={size}>Saving</Button>
            <Button {...args} variant="default" size={size} loading>Saving</Button>
          </span>
        ))}
      </div>
    </div>
  ),
  /* Figma 39:426 Loading vs Default widths: +20 / +22 / +32 (Spinner 16 + gap 4, 16 + 6, 24 + 8). */
  play: async ({ canvasElement }) => {
    const buttons = within(within(canvasElement).getByTestId('growth')).getAllByRole('button');
    const growth = [0, 2, 4].map((i) => buttons[i + 1]!.getBoundingClientRect().width - buttons[i]!.getBoundingClientRect().width);
    await expect(growth).toEqual([20, 22, 32]);
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true, variant: 'primary', iconAfter: ArrowRight },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Button {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button.getBoundingClientRect().width).toBe(320);
  },
};
