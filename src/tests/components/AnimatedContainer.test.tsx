// src/components/animated-container/AnimatedContainer.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAnimation as mockedUseAnimation } from 'animation-library-test-abdullah-altun';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AnimatedContainer } from '@/components/animated-container';
import styles from '@/components/animated-container/AnimatedContainer.module.scss';
import type { AnimationConfig } from '@/types/animations';

// Mock the animation library's useAnimation hook
const mockReplayFn = vi.fn();
const mockRefObj = { current: null };
let mockKeyToReturn = 0;

vi.mock('animation-library-test-abdullah-altun', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('animation-library-test-abdullah-altun')
    >();
  const mockUseAnimationSpy = vi.fn(() => ({
    ref: mockRefObj,
    key: mockKeyToReturn,
    replay: mockReplayFn,
    pause: vi.fn(),
    resume: vi.fn(),
  }));
  return {
    ...actual,
    useAnimation: mockUseAnimationSpy,
  };
});

// Importing the mocked module ensures the mock is in place for all tests

describe('AnimatedContainer Component', () => {
  const sampleConfig: AnimationConfig = {
    type: 'fade',
    duration: 1,
    delay: 0,
    easing: 'ease-out',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockKeyToReturn = 0;
    mockRefObj.current = null;
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
    expect(mockedUseAnimation).toHaveBeenCalledTimes(1);
    expect(mockedUseAnimation).toHaveBeenCalledWith(sampleConfig);
  });

  it('should apply key from useAnimation to the default animatable element', () => {
    mockKeyToReturn = 123;
    const { rerender } = render(<AnimatedContainer config={sampleConfig} />);
    expect(mockedUseAnimation.mock.results[0].value.key).toBe(123);
    mockKeyToReturn = 456;
    rerender(<AnimatedContainer config={sampleConfig} />);
    expect(mockedUseAnimation).toHaveBeenCalledTimes(2);
    expect(mockedUseAnimation.mock.results[1].value.key).toBe(456);
  });

  it('should apply key from useAnimation to the provided child element', () => {
    mockKeyToReturn = 789;
    render(
      <AnimatedContainer config={sampleConfig}>
        <div data-testid="child-to-animate">Child</div>
      </AnimatedContainer>
    );
    expect(mockedUseAnimation.mock.results[0].value.key).toBe(789);
  });

  it('should call replay function from useAnimation when Replay button is clicked', async () => {
    const user = userEvent.setup();
    render(<AnimatedContainer config={sampleConfig} />);
    const replayButton = screen.getByRole('button', {
      name: /replay animation/i,
    });
    await user.click(replayButton);
    expect(mockReplayFn).toHaveBeenCalledTimes(1);
  });
});
