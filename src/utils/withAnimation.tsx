'use client';

import React from 'react';
import { AnimationConfig } from '@/types/animations';

/**
 * Higher Order Component (HOC) for applying animations to any component
 * without adding extra DOM elements to the tree
 *
 * @param WrappedComponent Component to animate
 * @param config Animation configuration
 * @returns Animated component that preserves the original component's DOM structure
 */
export function withAnimation<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: AnimationConfig
) {
  // Return a new component
  const WithAnimation = React.forwardRef<HTMLElement, P>((props, ref) => {
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

    // Create a ref to access the DOM element
    const elementRef = React.useRef<HTMLElement>(null);

    // Combine refs if both are provided
    const combinedRef = React.useMemo(() => {
      if (ref) {
        return typeof ref === 'function'
          ? (node: HTMLElement) => {
              elementRef.current = node;
              ref(node);
            }
          : { current: null };
      }
      return elementRef;
    }, [ref]);

    // Apply CSS custom properties when component mounts
    React.useEffect(() => {
      if (elementRef.current) {
        // Add animation class
        const animationClass = getAnimationClass();
        elementRef.current.classList.add(animationClass);

        // Apply CSS custom properties
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

        elementRef.current.style.setProperty(
          '--fade-delay',
          `${config.delay}s`
        );
        elementRef.current.style.setProperty(
          '--slide-delay',
          `${config.delay}s`
        );
        elementRef.current.style.setProperty(
          '--scale-delay',
          `${config.delay}s`
        );
        elementRef.current.style.setProperty(
          '--rotate-delay',
          `${config.delay}s`
        );
        elementRef.current.style.setProperty(
          '--bounce-delay',
          `${config.delay}s`
        );

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

        // Add accessibility attributes
        elementRef.current.setAttribute('aria-live', 'polite');

        // Clean up function
        return () => {
          if (elementRef.current) {
            elementRef.current.classList.remove(animationClass);
          }
        };
      }
    }, []);

    // Render the wrapped component with the ref
    return <WrappedComponent {...props} ref={combinedRef} />;
  });

  // Set display name for debugging
  WithAnimation.displayName = `WithAnimation(${getDisplayName(WrappedComponent)})`;

  return WithAnimation;
}

// Helper function to get component display name
function getDisplayName<P extends object>(
  WrappedComponent: React.ComponentType<P>
): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
