// Utility functions for animations

import { AnimationConfig } from '@/types/animations';

/**
 * Animation configuration definitions for generating keyframes
 */
const ANIMATION_DEFINITIONS = {
  fade: {
    name: 'fadeIn',
    getKeyframes: (config: AnimationConfig) => {
      const startOpacity = config.opacity?.start ?? 0;
      const endOpacity = config.opacity?.end ?? 1;
      return `@keyframes fadeIn {
  from { opacity: ${startOpacity}; }
  to { opacity: ${endOpacity}; }
}`;
    },
  },
  slide: {
    getName: (config: AnimationConfig) => {
      const direction =
        config.distance && config.distance < 0 ? 'Left' : 'Right';
      return `slideIn${direction}`;
    },
    getKeyframes: (config: AnimationConfig) => {
      const distance = config.distance ?? 50;
      const direction = distance < 0 ? 'Left' : 'Right';
      const name = `slideIn${direction}`;
      return `@keyframes ${name} {
  from { transform: translateX(${direction === 'Left' ? -Math.abs(distance) : Math.abs(distance)}px); }
  to { transform: translateX(0); }
}`;
    },
  },
  scale: {
    name: 'scaleIn',
    getKeyframes: (config: AnimationConfig) => {
      const scale = config.scale ?? 0.8;
      return `@keyframes scaleIn {
  from { transform: scale(${scale}); }
  to { transform: scale(1); }
}`;
    },
  },
  rotate: {
    name: 'rotateIn',
    getKeyframes: (config: AnimationConfig) => {
      const degrees = config.degrees ?? 360;
      return `@keyframes rotateIn {
  from { transform: rotate(${degrees}deg); }
  to { transform: rotate(0); }
}`;
    },
  },
  bounce: {
    name: 'bounceIn',
    getKeyframes: (config: AnimationConfig) => {
      const height = config.distance ?? 30;
      return `@keyframes bounceIn {
  0% { transform: translateY(0); }
  50% { transform: translateY(-${height}px); }
  100% { transform: translateY(0); }
}`;
    },
  },
};

// Default values MUST match the defaults in the useAnimation hook
const DEFAULTS = {
  duration: 0.5,
  delay: 0,
  easing: 'ease-out',
  opacityStart: 0,
  opacityEnd: 1,
  distance: 50,
  degrees: 360,
  scale: 0.8,
};

/**
 * Gets the animation name based on configuration
 */
function getAnimationName(config: AnimationConfig): string {
  const definition = ANIMATION_DEFINITIONS[config.type];
  if ('getName' in definition) {
    return definition.getName(config);
  }
  return definition.name;
}

/**
 * Generates CSS code for the animation configuration
 */
export function generateCSSCode(config: AnimationConfig): string {
  const { duration, delay, easing } = config;
  const animationName = getAnimationName(config);

  let css = `.animated-element {
  animation: ${animationName} ${duration}s ${easing} ${delay}s forwards;
}

`;

  const definition = ANIMATION_DEFINITIONS[config.type];
  css += definition.getKeyframes(config);

  return css;
}

/**
 * Generates a concise React code snippet using the <Animate> component.
 * Only includes props that differ from the library's defaults.
 */
export function generateReactComponent(config: AnimationConfig): string {
  const { type } = config; // Removed 'name' as it's unused
  const componentName = `// ${type.charAt(0).toUpperCase() + type.slice(1)} Animation \n`;

  // Build props string, ONLY including non-default values
  const propsArray: string[] = [`type="${type}"`]; // Type is always required

  if (config.duration !== undefined && config.duration !== DEFAULTS.duration) {
    propsArray.push(`duration={${config.duration}}`);
  }
  if (config.delay !== undefined && config.delay !== DEFAULTS.delay) {
    propsArray.push(`delay={${config.delay}}`);
  }
  if (config.easing !== undefined && config.easing !== DEFAULTS.easing) {
    propsArray.push(`easing="${config.easing}"`);
  }

  if (type === 'fade' && config.opacity) {
    const { start, end } = config.opacity;
    const startProp =
      start !== undefined && start !== DEFAULTS.opacityStart
        ? `start: ${start}`
        : '';
    const endProp =
      end !== undefined && end !== DEFAULTS.opacityEnd ? `end: ${end}` : '';
    if (startProp || endProp) {
      propsArray.push(
        `opacity={{ ${startProp}${startProp && endProp ? ', ' : ''}${endProp} }}`
      );
    }
  }
  if (
    (type === 'slide' || type === 'bounce') &&
    config.distance !== undefined &&
    config.distance !== DEFAULTS.distance
  ) {
    propsArray.push(`distance={${config.distance}}`);
  }
  if (
    type === 'scale' &&
    config.scale !== undefined &&
    config.scale !== DEFAULTS.scale
  ) {
    propsArray.push(`scale={${config.scale}}`);
  }
  if (
    type === 'rotate' &&
    config.degrees !== undefined &&
    config.degrees !== DEFAULTS.degrees
  ) {
    propsArray.push(`degrees={${config.degrees}}`);
  }

  // Format props nicely indented
  const propsString = propsArray.map((p) => `      ${p}`).join('\n');

  let component = `${componentName}`;
  component += `<Animate\n`;
  component += `${propsString}\n    >\n`;
  component += `    {children}\n`;
  component += `</Animate>\n`;

  return component;
}
