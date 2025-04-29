'use client';

import React from 'react';

import { ResetIcon } from '@radix-ui/react-icons';
import { Button, Heading, Text } from '@radix-ui/themes';
import {
  useAnimation,
  AnimationConfig,
} from 'animation-library-test-abdullah-altun';

import styles from './AnimatedContainer.module.scss';

interface AnimatedContainerProps {
  children?: React.ReactNode;
  config: AnimationConfig;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  config,
}) => {
  // Using the animation hook from the library
  const { ref, key, replay } = useAnimation<HTMLDivElement>(config);

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
              key={key}
              ref={ref} // Ref from the hook attaches to the DOM element
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
