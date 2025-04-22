'use client';

import React from 'react';

import { ResetIcon } from '@radix-ui/react-icons';
import { Button, Heading, Text } from '@radix-ui/themes';

// Import the hook and types FROM THE LIBRARY
import {
  useAnimation,
  AnimationConfig,
} from 'animation-library-test-abdullah-altun';

import styles from './AnimatedContainer.module.scss';

interface AnimatedContainerProps {
  children?: React.ReactNode; // Keep children prop if you want to allow custom content
  config: AnimationConfig; // Use the config type from the library
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  config, // Receive the config object directly
}) => {
  // Use the animation hook from the library
  const { ref, key, replay } = useAnimation<HTMLDivElement>(config);

  // No need for getAnimationClasses or useEffect here anymore!

  return (
    <>
      <Heading className={styles.title}>Animation Preview</Heading>
      <div className={styles.container}>
        <div className={styles.animationBox}>
          {/*
            Apply the ref and key directly to the element you want to animate.
            The hook handles adding/removing the necessary 'animate-*' class.
          */}
          {children || (
            <div
              key={key} // Key from the hook is essential for replaying
              ref={ref} // Ref from the hook attaches to the DOM element
              className={styles.animatableElement} // Base styles for the box itself
              // The animation class (e.g., 'animate-fade') will be added by the hook's effect
            >
              <Text>Animate Me!</Text>
            </div>
          )}
        </div>
        {/* Replay button now calls the replay function from the hook */}
        <Button className={styles.replayButton} onClick={replay}>
          <ResetIcon /> Replay Animation
        </Button>
      </div>
    </>
  );
};
