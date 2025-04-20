'use client';

import { useEffect, useRef, useState } from 'react';

import { AnimationConfig } from '@/types/animations';

/**
 * Custom hook for applying animations to any component without adding extra DOM elements
 *
 * @param config Animation configuration
 * @returns Object containing ref to be applied to the target element and animation control functions
 */
export function useAnimation(config: AnimationConfig) {
  const [key, setKey] = useState(0);
  const elementRef = useRef<HTMLElement>(null);

  // Function to get animation class based on config type
  const getAnimationClass = (): string => {
    switch (config.type) {
      case 'fade':
        return 'fade-in';
      case 'slide':
        return config.distance && config.distance < 0
          ? 'slide-in-left'
          : 'slide-in-right';
      case 'scale':
        return 'scale-in';
      case 'rotate':
        return 'rotate-in';
      case 'bounce':
        return 'bounce-in';
      default:
        return '';
    }
  };

  // Apply CSS custom properties and force re-render when config changes
  useEffect(() => {
    if (elementRef.current) {
      // Add animation class
      const animationClass = getAnimationClass();
      elementRef.current.classList.add(animationClass);

      // Convert duration, delay and other parameters to CSS custom properties
      // Duration for all animation types
      elementRef.current.style.setProperty(
        '--fade-duration',
        `${config.duration}s`
      );
      elementRef.current.style.setProperty(
        '--slide-duration',
        `${config.duration}s`
      );
      elementRef.current.style.setProperty(
        '--scale-duration',
        `${config.duration}s`
      );
      elementRef.current.style.setProperty(
        '--rotate-duration',
        `${config.duration}s`
      );
      elementRef.current.style.setProperty(
        '--bounce-duration',
        `${config.duration}s`
      );

      // Delay for all animation types
      elementRef.current.style.setProperty('--fade-delay', `${config.delay}s`);
      elementRef.current.style.setProperty('--slide-delay', `${config.delay}s`);
      elementRef.current.style.setProperty('--scale-delay', `${config.delay}s`);
      elementRef.current.style.setProperty(
        '--rotate-delay',
        `${config.delay}s`
      );
      elementRef.current.style.setProperty(
        '--bounce-delay',
        `${config.delay}s`
      );

      // Easing for all animation types
      elementRef.current.style.setProperty('--fade-easing', config.easing);
      elementRef.current.style.setProperty('--slide-easing', config.easing);
      elementRef.current.style.setProperty('--scale-easing', config.easing);
      elementRef.current.style.setProperty('--rotate-easing', config.easing);
      elementRef.current.style.setProperty('--bounce-easing', config.easing);

      // Type-specific variables
      if (config.type === 'fade' && config.opacity) {
        elementRef.current.style.setProperty(
          '--fade-opacity-start',
          config.opacity.start.toString()
        );
        elementRef.current.style.setProperty(
          '--fade-opacity-end',
          config.opacity.end.toString()
        );
      }

      if (config.type === 'slide' && config.distance !== undefined) {
        elementRef.current.style.setProperty(
          '--slide-distance',
          `${Math.abs(config.distance)}px`
        );
      }

      if (config.type === 'scale' && config.scale !== undefined) {
        elementRef.current.style.setProperty(
          '--scale-from',
          config.scale.toString()
        );
      }

      if (config.type === 'rotate' && config.degrees !== undefined) {
        elementRef.current.style.setProperty(
          '--rotate-degrees',
          `${config.degrees}deg`
        );
      }

      if (config.type === 'bounce' && config.distance !== undefined) {
        elementRef.current.style.setProperty(
          '--bounce-height',
          `${config.distance}px`
        );
      }

      // Clean up function to remove animation class when component unmounts
      return () => {
        if (elementRef.current) {
          elementRef.current.classList.remove(animationClass);
        }
      };
    }
  }, [config, key]);

  // Function to replay the animation
  const replay = () => {
    setKey((prevKey) => prevKey + 1);
  };

  // Function to pause the animation
  const pause = () => {
    if (elementRef.current) {
      elementRef.current.style.animationPlayState = 'paused';
    }
  };

  // Function to resume the animation
  const resume = () => {
    if (elementRef.current) {
      elementRef.current.style.animationPlayState = 'running';
    }
  };

  return {
    ref: elementRef,
    key,
    replay,
    pause,
    resume,
  };
}
