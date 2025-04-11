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
    }
  },
  slide: {
    getName: (config: AnimationConfig) => {
      const direction = config.distance && config.distance < 0 ? 'Left' : 'Right';
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
    }
  },
  scale: {
    name: 'scaleIn',
    getKeyframes: (config: AnimationConfig) => {
      const scale = config.scale ?? 0.8;
      return `@keyframes scaleIn {
  from { transform: scale(${scale}); }
  to { transform: scale(1); }
}`;
    }
  },
  rotate: {
    name: 'rotateIn',
    getKeyframes: (config: AnimationConfig) => {
      const degrees = config.degrees ?? 360;
      return `@keyframes rotateIn {
  from { transform: rotate(${degrees}deg); }
  to { transform: rotate(0); }
}`;
    }
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
    }
  },
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

  // Add keyframes based on type
  const definition = ANIMATION_DEFINITIONS[config.type];
  css += definition.getKeyframes(config);

  return css;
}

/**
 * Generates React component code for the animation configuration
 */
export function generateReactComponent(config: AnimationConfig): string {
  const { duration, delay, easing } = config;
  const animationName = getAnimationName(config);
  const definition = ANIMATION_DEFINITIONS[config.type];

  let component = `import React from 'react';\n\n`;
  component += `// Animation component generated from ${config.name || 'Animation Playground'}\n`;
  component += `export const AnimatedElement${config.type.charAt(0).toUpperCase() + config.type.slice(1)} = ({ \n`;
  component += `    children, \n`;
  component += `}: {\n`;
  component += `    children: React.ReactNode; \n`;
  component += `}) => {\n`;
  component += `  const style = {\n`;
  component += `    animation: '${animationName} ${duration}s ${easing} ${delay}s forwards',\n`;
  component += `  };\n\n`;

  // Add keyframes comment
  component += `  // Add this CSS to your stylesheet:\n`;
  const keyframes = definition.getKeyframes(config)
    .split('\n')
    .map(line => `  // ${line}`)
    .join('\n');
  component += keyframes + '\n';

  component += `  return (\n`;
  component += `    <div style={style}>\n`;
  component += `      {children}\n`;
  component += `    </div>\n`;
  component += `  );\n`;
  component += `};\n`;

  return component;
}
