'use client';

import React from 'react';

import { ResetIcon } from '@radix-ui/react-icons';
import { Button, Heading, Text } from '@radix-ui/themes';
import {
  useAnimation,
  AnimationConfig,
} from 'animation-library-test-abdullah-altun';

import styles from './AnimatedContainer.module.scss';

/**
 * @interface AnimatedContainerProps
 * @description Defines the props for the AnimatedContainer component.
 * @property {React.ReactNode} [children] - Optional children to render inside the animated area. If not provided, a default "Animate Me!" text is shown.
 * @property {AnimationConfig} config - The animation configuration object from `animation-library-test-abdullah-altun`.
 */
interface AnimatedContainerProps {
  children?: React.ReactNode;
  config: AnimationConfig;
}

/**
 * @component AnimatedContainer
 * @description A presentational component that provides a container for animations
 * managed by the `useAnimation` hook from `animation-library-test-abdullah-altun`.
 * It displays an animation preview area and a "Replay Animation" button.
 * The actual animated element should receive the `ref` and `key` provided by the `useAnimation` hook.
 * @param {AnimatedContainerProps} props - The props for the component.
 */
export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  config,
}) => {
  const { ref, key, replay } = useAnimation<HTMLDivElement>(config);

  return (
    <>
      <Heading className={styles.title}>Animation Preview</Heading>
      <div className={styles.container}>
        <div className={styles.animationBox}>
          {/* If children are provided, they are rendered directly.
              Otherwise, a default div is rendered and animated.
              The key from useAnimation is crucial for re-triggering the animation on replay.
              The ref from useAnimation must be attached to the element intended to be animated. */}
          {children || (
            <div
              key={key} // Ensures animation replays
              ref={ref} // Attaches animation controls to this element
              className={styles.animatableElement}
            >
              <Text>Animate Me!</Text>
            </div>
          )}
        </div>
        <Button className={styles.replayButton} onClick={replay}>
          <ResetIcon /> Replay Animation
        </Button>
      </div>
    </>
  );
};
