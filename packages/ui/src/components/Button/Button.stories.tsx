import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const row = { display: 'flex', gap: 'var(--ac-dimension-space-400)', alignItems: 'center' } as const;
const variants = ['default', 'primary', 'secondary', 'tertiary', 'danger'] as const;

/** Resolves a color token to the computed rgb() string, so a play function can compare it with an element. */
function tokenColor(canvasElement: HTMLElement, token: string) {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  canvasElement.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

/** The disabled look (DEV-110): background.disabled + text.disabled + icon.disabled, no visible border, no opacity.
    secondary keeps its border width as a transparent border so its width does not change (DEV-167). */
async function expectDisabledLook(canvasElement: HTMLElement, button: HTMLElement) {
  const style = getComputedStyle(button);
  await expect(style.backgroundColor).toBe(tokenColor(canvasElement, '--ac-color-background-disabled'));
  await expect(style.color).toBe(tokenColor(canvasElement, '--ac-color-text-disabled'));
  if (style.borderTopWidth !== '0px') await expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)');
  await expect(style.opacity).toBe('1');
  const glyph = button.querySelector(glyphSelector);
  if (glyph) await expect(getComputedStyle(glyph).color).toBe(tokenColor(canvasElement, '--ac-color-icon-disabled'));
}

/** Icon (svg) or Spinner (span role="status"), whichever sits in the glyph slot. */
const glyphSelector = 'svg, [role="status"]';

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

/** Every variant shares one disabled look (Figma 39:426); hover and pressed do not change it. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div style={row}>
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant} iconBefore={ArrowLeft}>{variant}</Button>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole('button')) {
      await expect(button).toBeDisabled();
      await expectDisabledLook(canvasElement, button);
    }
    const primary = within(canvasElement).getByRole('button', { name: 'primary' });
    await userEvent.hover(primary);
    await expectDisabledLook(canvasElement, primary);
  },
};

/** secondary's border sits inside its width like Figma's inside stroke (DEV-167): the same label gives the same width
    as default, and disabling it (border made transparent) does not shift it. */
export const SecondaryWidths: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ac-dimension-space-400)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={row} data-testid={`widths-${size}`}>
          <Button {...args} size={size} variant="default">Label</Button>
          <Button {...args} size={size} variant="secondary">Label</Button>
          <Button {...args} size={size} variant="secondary" disabled>Label</Button>
          <Button {...args} size={size} variant="secondary" iconBefore={Plus}>Label</Button>
          <Button {...args} size={size} variant="default" iconBefore={Plus}>Label</Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const size of ['sm', 'md', 'lg']) {
      const buttons = within(within(canvasElement).getByTestId(`widths-${size}`)).getAllByRole('button');
      const [base, secondary, disabled, withIcon, defaultWithIcon] = buttons.map((b) => b.getBoundingClientRect());
      await expect(secondary!.width).toBe(base!.width);
      await expect(disabled!.width).toBe(base!.width);
      await expect(secondary!.height).toBe(base!.height);
      await expect(disabled!.height).toBe(base!.height);
      await expect(withIcon!.width).toBe(defaultWithIcon!.width);
      await expect(getComputedStyle(buttons[1]!).borderTopWidth).toBe('1px');
    }
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
    // The surface is unchanged while loading (only an explicit disabled switches to the disabled look).
    await expect(getComputedStyle(button).backgroundColor).not.toBe(tokenColor(canvasElement, '--ac-color-background-disabled'));
    await expect(getComputedStyle(button.querySelector(glyphSelector)!).color).toBe(tokenColor(canvasElement, '--ac-color-icon-inverse'));
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

/** An explicit disabled keeps its look while loading, whatever the element or focusability (Codex P2 on PR #4). */
export const DisabledWhileLoading: Story = {
  args: { disabled: true, loading: true, variant: 'primary' },
  render: (args) => (
    <div style={row}>
      <Button {...args}>Native</Button>
      <Button {...args} render={<a href="#save" />}>Link</Button>
      <Button {...args} focusableWhenDisabled>Focusable</Button>
    </div>
  ),
  /* The Spinner takes icon.disabled too (2026-10-28), not primary's icon.inverse. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['Native', 'Link', 'Focusable']) {
      const button = canvas.getByRole('button', { name });
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await expectDisabledLook(canvasElement, button);
    }
  },
};
