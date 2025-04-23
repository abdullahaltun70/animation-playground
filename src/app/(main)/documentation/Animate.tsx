import React, { useState, useRef, useEffect } from 'react';

// Define the props for the Animate component
interface AnimateProps {
  children: React.ReactElement;
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce';
  duration?: number;
  delay?: number;
  easing?: string;
  distance?: number;
  degrees?: number;
  scale?: number;
  opacity?: {
    start?: number;
    end?: number;
  };
  className?: string;
  onAnimationStart?: (event: AnimationEvent) => void;
  onAnimationEnd?: (event: AnimationEvent) => void;
}

// Define the interface for the ref that will be exposed
export interface AnimateRef {
  replay: () => void;
}

const Animate: React.FC<AnimateProps> = ({
  children,
  type,
  duration = 0.5,
  delay = 0,
  easing = 'ease-out',
  distance,
  degrees,
  scale,
  opacity = { start: 0, end: 1 },
  className,
  onAnimationStart,
  onAnimationEnd,
}) => {
  const [key, setKey] = useState(0);
  const elementRef = useRef<HTMLElement>(null);

  // Determine animation class and direction based on props
  const getAnimationClass = (): string => {
    switch (type) {
      case 'fade':
        return 'animate-fade';
      case 'slide':
        // Determine axis and direction based on distance sign
        if (distance === undefined) return 'animate-slide-x';

        if (distance === 0) return 'animate-slide-x';

        // Horizontal slide
        if (Math.abs(distance) === distance) {
          return 'animate-slide-x-positive'; // Right
        } else {
          return 'animate-slide-x-negative'; // Left
        }
      case 'scale':
        return 'animate-scale';
      case 'rotate':
        if (degrees === undefined) return 'animate-rotate';

        if (degrees === 0) return 'animate-rotate';

        if (Math.abs(degrees) === degrees) {
          return 'animate-rotate-positive'; // Clockwise
        } else {
          return 'animate-rotate-negative'; // Counter-clockwise
        }
      case 'bounce':
        if (distance === undefined) return 'animate-bounce';

        if (distance === 0) return 'animate-bounce';

        if (Math.abs(distance) === distance) {
          return 'animate-bounce-positive'; // Up
        } else {
          return 'animate-bounce-negative'; // Down
        }
      default:
        return '';
    }
  };

  // Apply CSS custom properties when component mounts or props change
  useEffect(() => {
    if (elementRef.current) {
      const animationClass = getAnimationClass();

      // Remove any previous animation classes
      elementRef.current.classList.forEach((cls) => {
        if (cls.startsWith('animate-')) {
          elementRef.current?.classList.remove(cls);
        }
      });

      // Add new animation class
      elementRef.current.classList.add(animationClass);

      // Set CSS custom properties
      elementRef.current.style.setProperty(
        '--animation-duration',
        `${duration}s`
      );
      elementRef.current.style.setProperty('--animation-delay', `${delay}s`);
      elementRef.current.style.setProperty('--animation-easing', easing);

      // Type-specific properties
      if (type === 'fade' && opacity) {
        elementRef.current.style.setProperty(
          '--opacity-start',
          opacity.start?.toString() || '0'
        );
        elementRef.current.style.setProperty(
          '--opacity-end',
          opacity.end?.toString() || '1'
        );
      }

      if ((type === 'slide' || type === 'bounce') && distance !== undefined) {
        elementRef.current.style.setProperty(
          '--distance',
          `${Math.abs(distance)}px`
        );
      }

      if (type === 'scale' && scale !== undefined) {
        elementRef.current.style.setProperty('--scale', scale.toString());
      }

      if (type === 'rotate' && degrees !== undefined) {
        elementRef.current.style.setProperty(
          '--degrees',
          `${Math.abs(degrees)}deg`
        );
      }

      // Add event listeners
      if (onAnimationStart || onAnimationEnd) {
        const element = elementRef.current;

        if (onAnimationStart) {
          element.addEventListener('animationstart', onAnimationStart);
        }

        if (onAnimationEnd) {
          element.addEventListener('animationend', onAnimationEnd);
        }

        // Clean up event listeners
        return () => {
          if (onAnimationStart) {
            element.removeEventListener('animationstart', onAnimationStart);
          }

          if (onAnimationEnd) {
            element.removeEventListener('animationend', onAnimationEnd);
          }
        };
      }
    }
  }, [
    type,
    duration,
    delay,
    easing,
    distance,
    degrees,
    scale,
    opacity,
    key,
    onAnimationStart,
    onAnimationEnd,
  ]);

  // Function to replay the animation
  const replay = () => {
    setKey((prevKey) => prevKey + 1);
  };

  // Safely determine combined className
  const childProps = React.isValidElement<{ className?: string }>(children)
    ? children.props
    : {};
  const combinedClassName =
    `${childProps.className || ''} ${className || ''}`.trim() || undefined;

  // Create a ref that exposes the replay method
  React.useImperativeHandle(
    children.ref,
    () => ({
      replay,
      ...children.ref,
    }),
    [replay]
  );

  // Clone the child element and add the ref, but don't pass replay as a prop
  return React.cloneElement(children, {
    ref: elementRef,
    key: key,
    className: combinedClassName,
    // Add data attributes for animation info (useful for testing and debugging)
    'data-animation-type': type,
    'data-animation-duration': duration,
    'data-animation-delay': delay,
    // Don't pass replay as a prop to avoid DOM warnings
  } as any);
};

export default Animate;
