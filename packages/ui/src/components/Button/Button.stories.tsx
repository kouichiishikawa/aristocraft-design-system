import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Get in touch', onClick: fn() },
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Base UI の Button に CSS Modules で @aristocraft/tokens を当てた部品。色は color.background.brand / neutral、寸法は dimension.size と space、文字は font.label。',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Get in touch' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--ac-dimension-space-400)', alignItems: 'center' }}>
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
