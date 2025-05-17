// src/tests/components/ConfigPanel.test.tsx
import { Theme } from '@radix-ui/themes';
import { render, screen, waitFor, within } from '@testing-library/react'; // Added within
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DEFAULT_ANIMATION_CONFIG } from '@/app/(main)/playground/hooks/useAnimationConfig';
import { ConfigPanel } from '@/components/config-panel/ConfigPanel';
import styles from '@/components/config-panel/ConfigPanel.module.scss';
import type { AnimationConfig } from '@/types/animations';

describe('ConfigPanel Component', () => {
  const mockOnConfigChange = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnReset = vi.fn();

  const baseInitialConfig: AnimationConfig = {
    ...DEFAULT_ANIMATION_CONFIG,
    name: 'Test Animation',
    description: 'A test description',
    type: 'fade',
    duration: 0.7,
    delay: 0.2,
    easing: 'ease-in',
    opacity: { start: 0.2, end: 0.8 },
    isPublic: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderConfigPanel = (
    props: Partial<React.ComponentProps<typeof ConfigPanel>> = {}
  ) => {
    const defaultProps = {
      initialConfig: baseInitialConfig,
      onConfigChange: mockOnConfigChange,
      onSave: mockOnSave,
      onReset: mockOnReset,
    };
    return render(
      <Theme>
        <ConfigPanel {...defaultProps} {...props} />
      </Theme>
    );
  };

  it('should render with initialConfig values', () => {
    renderConfigPanel();
    expect(screen.getByLabelText('Configuration Name')).toHaveValue(
      'Test Animation'
    );
    expect(screen.getByLabelText('Description')).toHaveValue(
      'A test description'
    );

    const animationTypeTrigger = screen.getByRole('combobox', {
      name: 'Animation Type',
    });
    expect(animationTypeTrigger).toBeInTheDocument();
    expect(animationTypeTrigger).toHaveTextContent('Fade');

    const easingFunctionTrigger = screen.getByRole('combobox', {
      name: 'Easing Function',
    });
    expect(easingFunctionTrigger).toBeInTheDocument();
    expect(easingFunctionTrigger).toHaveTextContent('Ease In');

    // For Sliders: Radix Slider.Root is the one labelled. Thumbs are children.
    const durationSliderRoot = screen.getByLabelText('Duration (seconds)');
    expect(
      within(durationSliderRoot.closest(`.${styles.field}`)!).getByText('0.7s')
    ).toBeInTheDocument();

    const delaySliderRoot = screen.getByLabelText('Delay (seconds)');
    expect(
      within(delaySliderRoot.closest(`.${styles.field}`)!).getByText('0.2s')
    ).toBeInTheDocument();

    const startOpacitySliderRoot = screen.getByLabelText('Start Opacity');
    expect(
      within(startOpacitySliderRoot.closest(`.${styles.field}`)!).getByText(
        '20%'
      )
    ).toBeInTheDocument();

    const endOpacitySliderRoot = screen.getByLabelText('End Opacity');
    expect(
      within(endOpacitySliderRoot.closest(`.${styles.field}`)!).getByText('80%')
    ).toBeInTheDocument();

    const privateOption = screen.getByRole('radio', { name: 'Private' });
    expect(privateOption).toBeInTheDocument();
    expect(privateOption).toHaveAttribute('aria-checked', 'true');
    expect(privateOption).toHaveAttribute('data-state', 'on');
  });

  it('should render with default values if no initialConfig is provided', () => {
    renderConfigPanel({ initialConfig: undefined });
    expect(screen.getByLabelText('Configuration Name')).toHaveValue(
      DEFAULT_ANIMATION_CONFIG.name || ''
    );
    expect(screen.getByLabelText('Description')).toHaveValue(
      DEFAULT_ANIMATION_CONFIG.description || ''
    );

    const animationTypeTrigger = screen.getByRole('combobox', {
      name: 'Animation Type',
    });
    expect(animationTypeTrigger).toHaveTextContent(
      DEFAULT_ANIMATION_CONFIG.type.charAt(0).toUpperCase() +
        DEFAULT_ANIMATION_CONFIG.type.slice(1)
    );

    const easingFunctionTrigger = screen.getByRole('combobox', {
      name: 'Easing Function',
    });
    const expectedEasingText =
      DEFAULT_ANIMATION_CONFIG.easing === 'ease-out'
        ? 'Ease Out'
        : DEFAULT_ANIMATION_CONFIG.easing ===
            'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          ? 'Elastic'
          : DEFAULT_ANIMATION_CONFIG.easing;
    expect(easingFunctionTrigger).toHaveTextContent(expectedEasingText);

    const durationSliderRoot = screen.getByLabelText('Duration (seconds)');
    expect(
      within(durationSliderRoot.closest(`.${styles.field}`)!).getByText(
        `${DEFAULT_ANIMATION_CONFIG.duration.toFixed(1)}s`
      )
    ).toBeInTheDocument();

    const startOpacitySliderRoot = screen.getByLabelText('Start Opacity');
    expect(
      within(startOpacitySliderRoot.closest(`.${styles.field}`)!).getByText(
        `${(DEFAULT_ANIMATION_CONFIG.opacity?.start ?? 0) * 100}%`
      )
    ).toBeInTheDocument();
  });

  it('should update name input but not call onConfigChange immediately', async () => {
    renderConfigPanel();
    const user = userEvent.setup();
    const nameInput = screen.getByLabelText('Configuration Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');
    expect(nameInput).toHaveValue('New Name');
    expect(mockOnConfigChange).not.toHaveBeenCalled();
  });

  it('should call onConfigChange and update fields when Animation Type is changed', async () => {
    renderConfigPanel({
      initialConfig: { ...baseInitialConfig, type: 'fade' },
    });
    const user = userEvent.setup();

    expect(screen.getByLabelText('Start Opacity')).toBeInTheDocument(); // The Slider.Root is labelled
    expect(
      screen.queryByLabelText('Distance (pixels)')
    ).not.toBeInTheDocument();

    const selectTrigger = screen.getByRole('combobox', {
      name: 'Animation Type',
    });
    expect(selectTrigger).toBeInTheDocument();

    await user.click(selectTrigger);
    // Options are usually in a listbox that appears.
    // The `name` for `findByRole('option', ...)` should be the exact text content of the option.
    const slideOption = await screen.findByRole('option', { name: 'Slide' });
    await user.click(slideOption);

    expect(mockOnConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'slide' })
    );

    expect(screen.queryByLabelText('Start Opacity')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Distance (pixels)')).toBeInTheDocument();
  });

  it('should have interactive Duration slider', async () => {
    renderConfigPanel();
    const durationSliderRoot = screen.getByLabelText('Duration (seconds)');
    expect(
      within(durationSliderRoot.closest(`.${styles.field}`)!).getByText('0.7s')
    ).toBeInTheDocument();
    expect(durationSliderRoot).toBeInTheDocument(); // Check the Slider.Root itself
  });

  // ... (Reset and Save tests - should be okay with waitFor imported and previous fixes) ...
  it('should call onReset when Reset button is clicked (not read-only)', async () => {
    renderConfigPanel({ isReadOnly: false });
    const user = userEvent.setup();
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    await user.click(resetButton);
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('Reset button should say "New Animation" and call onReset when isReadOnly', async () => {
    renderConfigPanel({ isReadOnly: true });
    const user = userEvent.setup();
    const newAnimationButton = screen.getByRole('button', {
      name: 'New Animation',
    });
    await user.click(newAnimationButton);
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should call onSave with updated config on Save (not read-only)', async () => {
    renderConfigPanel({ initialConfig: baseInitialConfig, isReadOnly: false });
    const user = userEvent.setup();
    const nameInput = screen.getByLabelText('Configuration Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Saved Name');

    const publicOption = screen.getByRole('radio', { name: 'Public' });
    await user.click(publicOption);

    await waitFor(() => {
      expect(mockOnConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({ isPublic: true })
      );
    });
    mockOnConfigChange.mockClear();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    const expectedConfigOnSave = {
      ...baseInitialConfig,
      name: 'Saved Name',
      isPublic: true,
    };

    expect(mockOnConfigChange).toHaveBeenCalledWith(expectedConfigOnSave);
    expect(mockOnSave).toHaveBeenCalledWith(expectedConfigOnSave);
  });

  it('Save button should reflect saveButtonText prop', () => {
    renderConfigPanel({ saveButtonText: 'Update Config' });
    expect(
      screen.getByRole('button', { name: 'Update Config' })
    ).toBeInTheDocument();
  });

  it('Save button should say "Save as my configuration" and call onSave when isReadOnly', async () => {
    renderConfigPanel({
      isReadOnly: true,
      initialConfig: baseInitialConfig,
      saveButtonText: 'Save as my configuration',
    });
    const user = userEvent.setup();
    const saveAsButton = screen.getByRole('button', {
      name: 'Save as my configuration',
    });
    await user.click(saveAsButton);
    expect(mockOnSave).toHaveBeenCalledWith(baseInitialConfig);
  });

  it('should disable all inputs when isReadOnly is true', () => {
    renderConfigPanel({ isReadOnly: true });
    expect(screen.getByLabelText('Configuration Name')).toBeDisabled();
    expect(screen.getByLabelText('Description')).toBeDisabled();

    expect(
      screen.getByRole('combobox', { name: 'Animation Type' })
    ).toBeDisabled();
    expect(
      screen.getByRole('combobox', { name: 'Easing Function' })
    ).toBeDisabled();

    // Check the Slider.Root component for disabled state
    expect(screen.getByLabelText('Duration (seconds)')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByLabelText('Delay (seconds)')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByLabelText('Start Opacity')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByLabelText('End Opacity')).toHaveAttribute(
      'aria-disabled',
      'true'
    );

    const visibilitySwitchGroup = screen.getByRole('group', {
      name: 'Visibility',
    });
    expect(visibilitySwitchGroup).toHaveAttribute('data-disabled', 'true');
  });

  it('should update and save with VisibilitySwitch changes', async () => {
    renderConfigPanel({
      initialConfig: { ...baseInitialConfig, isPublic: false },
    });
    const user = userEvent.setup();

    const publicOption = screen.getByRole('radio', { name: 'Public' });
    await user.click(publicOption);

    await waitFor(() => {
      expect(mockOnConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({ isPublic: true })
      );
    });
    mockOnConfigChange.mockClear();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    const expectedConfig = {
      ...baseInitialConfig,
      isPublic: true,
    };
    expect(mockOnConfigChange).toHaveBeenCalledWith(expectedConfig);
    expect(mockOnSave).toHaveBeenCalledWith(expectedConfig);
  });
});
