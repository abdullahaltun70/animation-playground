// src/components/animated-container/AnimatedContainer.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAnimation as mockedUseAnimation } from 'animation-library-test-abdullah-altun';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import { AnimatedContainer } from '@/components/animated-container';
import styles from '@/components/animated-container/AnimatedContainer.module.scss'; // Corrected path
import type { AnimationConfig } from '@/types/animations';

// --- Mock the animation library's useAnimation hook ---

// These will be used by the mock implementation *inside* the factory
const mockReplayFn = vi.fn();
const mockRefObj = { current: null };
let mockKeyToReturn = 0;

vi.mock('animation-library-test-abdullah-altun', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('animation-library-test-abdullah-altun')
    >();
  // This is the actual spy that will replace useAnimation.
  // It's defined *inside* the factory's scope or returned by it.
  const mockUseAnimationSpy = vi.fn(() => ({
    ref: mockRefObj,
    key: mockKeyToReturn,
    replay: mockReplayFn,
    pause: vi.fn(),
    resume: vi.fn(),
  }));
  return {
    ...actual,
    useAnimation: mockUseAnimationSpy, // Export the spy
  };
});

// After mocking, we can import the mocked module to get the spy if needed for direct manipulation,
// but often we can just rely on the mock being in place.
// For direct assertions on the spy, we'll import it.
// Vitest should ensure that this import gets the *mocked* version.

describe('AnimatedContainer Component', () => {
  const sampleConfig: AnimationConfig = {
    type: 'fade',
    duration: 1,
    delay: 0,
    easing: 'ease-out',
  };

  beforeEach(() => {
    // Clear all mocks (including the one from the factory)
    vi.clearAllMocks(); // This will reset call counts etc. on `mockedUseAnimation`

    // Reset shared state for the mock's return values
    mockKeyToReturn = 0;
    mockRefObj.current = null;

    // Re-assign the default implementation for the main spy if needed,
    // or rely on the factory being called anew if modules are re-evaluated per test (less common for vi.mock)
    // For safety, let's ensure the mock uses the reset values:
    (mockedUseAnimation as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      ref: mockRefObj,
      key: mockKeyToReturn,
      replay: mockReplayFn,
      pause: vi.fn(),
      resume: vi.fn(),
    }));
  });

  it('should render the "Animation Preview" heading and replay button', () => {
    render(<AnimatedContainer config={sampleConfig} />);
    expect(
      screen.getByRole('heading', { name: /animation preview/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /replay animation/i })
    ).toBeInTheDocument();
  });

  it('should render default "Animate Me!" content when no children are provided', () => {
    render(<AnimatedContainer config={sampleConfig} />);
    expect(screen.getByText('Animate Me!')).toBeInTheDocument();
    const defaultElement = screen.getByText('Animate Me!').parentElement;
    expect(defaultElement).toHaveClass(styles.animatableElement);
  });

  it('should render provided children instead of default content', () => {
    const childText = 'Custom Animated Child';
    render(
      <AnimatedContainer config={sampleConfig}>
        <div data-testid="custom-child">{childText}</div>
      </AnimatedContainer>
    );
    expect(screen.getByTestId('custom-child')).toHaveTextContent(childText);
    expect(screen.queryByText('Animate Me!')).not.toBeInTheDocument();
  });

  it('should call useAnimation hook with the provided config', () => {
    render(<AnimatedContainer config={sampleConfig} />);
    expect(mockedUseAnimation).toHaveBeenCalledTimes(1); // Assert on the imported mock
    expect(mockedUseAnimation).toHaveBeenCalledWith(sampleConfig);
  });

  it('should apply key from useAnimation to the default animatable element', () => {
    mockKeyToReturn = 123; // Set the key value our mock will return
    // The beforeEach mockImplementation will pick this up

    const { rerender } = render(<AnimatedContainer config={sampleConfig} />);
    // The component has rendered and called useAnimation, which used mockKeyToReturn = 123
    expect((mockedUseAnimation as Mock).mock.results[0].value.key).toBe(123);

    mockKeyToReturn = 456; // Change the key value for the next render

    rerender(<AnimatedContainer config={sampleConfig} />);
    expect(mockedUseAnimation).toHaveBeenCalledTimes(2);
    expect((mockedUseAnimation as Mock).mock.results[1].value.key).toBe(456);
  });

  it('should apply key from useAnimation to the provided child element', () => {
    mockKeyToReturn = 789; // Set the key value our mock will return

    render(
      <AnimatedContainer config={sampleConfig}>
        <div data-testid="child-to-animate">Child</div>
      </AnimatedContainer>
    );
    expect((mockedUseAnimation as Mock).mock.results[0].value.key).toBe(789);
  });

  it('should call replay function from useAnimation when Replay button is clicked', async () => {
    const user = userEvent.setup();
    render(<AnimatedContainer config={sampleConfig} />);
    const replayButton = screen.getByRole('button', {
      name: /replay animation/i,
    });

    await user.click(replayButton);

    expect(mockReplayFn).toHaveBeenCalledTimes(1); // Assert on the specific mock for replay
  });
});
