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
 * using the new AnimateElement component that preserves DOM structure
 */
export function generateReactComponent(config: AnimationConfig): string {
  const { type, duration, delay, easing } = config;
  const definition = ANIMATION_DEFINITIONS[config.type];

  let component = `import React from 'react';\n`;
  component += `import { AnimateElement } from '@/components/AnimateElement';\n\n`;
  component += `// Animation component generated from ${config.name || 'Animation Playground'}\n`;
  component += `export const ${type.charAt(0).toUpperCase() + type.slice(1)}Animation = ({ \n`;
  component += `    children, \n`;
  component += `}: {\n`;
  component += `    children: React.ReactElement; \n`;
  component += `}) => {\n`;
  component += `  const animationConfig = {\n`;
  component += `    type: '${type}',\n`;
  component += `    duration: ${duration},\n`;
  component += `    delay: ${delay},\n`;
  component += `    easing: '${easing}',\n`;

  // Add type-specific properties
  if (type === 'fade' && config.opacity) {
    component += `    opacity: {\n`;
    component += `      start: ${config.opacity.start},\n`;
    component += `      end: ${config.opacity.end},\n`;
    component += `    },\n`;
  }

  if (
    (type === 'slide' || type === 'bounce') &&
    config.distance !== undefined
  ) {
    component += `    distance: ${config.distance},\n`;
  }

  if (type === 'scale' && config.scale !== undefined) {
    component += `    scale: ${config.scale},\n`;
  }

  if (type === 'rotate' && config.degrees !== undefined) {
    component += `    degrees: ${config.degrees},\n`;
  }

  component += `  };\n\n`;

  component += `  return (\n`;
  component += `    <AnimateElement config={animationConfig}>\n`;
  component += `      {children}\n`;
  component += `    </AnimateElement>\n`;
  component += `  );\n`;
  component += `};\n\n`;

  // Add hook example
  component += `// Alternative implementation using hook\n`;
  component += `export const Use${type.charAt(0).toUpperCase() + type.slice(1)}Animation = ({ \n`;
  component += `    children, \n`;
  component += `}: {\n`;
  component += `    children: React.ReactElement; \n`;
  component += `}) => {\n`;
  component += `  const { ref, key, replay } = useAnimation(animationConfig);\n\n`;
  component += `  // Clone the child element and add the ref\n`;
  component += `  return React.cloneElement(children, { ref, key });\n`;
  component += `};\n\n`;

  // Add CSS comment
  component += `// Add this CSS to your stylesheet or import the animation library:\n`;
  const keyframes = definition
    .getKeyframes(config)
    .split('\n')
    .map((line) => `// ${line}`)
    .join('\n');
  component += keyframes + '\n';

  return component;
}

/**
 * Generates React HOC code for the animation configuration
 */
export function generateHOCCode(config: AnimationConfig): string {
  const { type, duration, delay, easing } = config;
  const definition = ANIMATION_DEFINITIONS[config.type];

  let component = `import React from 'react';\n`;
  component += `import { withAnimation } from '@/components/withAnimation';\n\n`;
  component += `// HOC animation example generated from ${config.name || 'Animation Playground'}\n\n`;
  component += `// Define your component\n`;
  component += `const YourComponent = React.forwardRef((props, ref) => {\n`;
  component += `  return <div ref={ref} {...props}>Your content here</div>;\n`;
  component += `});\n\n`;

  component += `// Animation configuration\n`;
  component += `const animationConfig = {\n`;
  component += `  type: '${type}',\n`;
  component += `  duration: ${duration},\n`;
  component += `  delay: ${delay},\n`;
  component += `  easing: '${easing}',\n`;

  // Add type-specific properties
  if (type === 'fade' && config.opacity) {
    component += `  opacity: {\n`;
    component += `    start: ${config.opacity.start},\n`;
    component += `    end: ${config.opacity.end},\n`;
    component += `  },\n`;
  }

  if (
    (type === 'slide' || type === 'bounce') &&
    config.distance !== undefined
  ) {
    component += `  distance: ${config.distance},\n`;
  }

  if (type === 'scale' && config.scale !== undefined) {
    component += `  scale: ${config.scale},\n`;
  }

  if (type === 'rotate' && config.degrees !== undefined) {
    component += `  degrees: ${config.degrees},\n`;
  }

  component += `};\n\n`;

  component += `// Create animated component using HOC\n`;
  component += `export const Animated${type.charAt(0).toUpperCase() + type.slice(1)}Component = withAnimation(YourComponent, animationConfig);\n\n`;

  // Add CSS comment
  component += `// Add this CSS to your stylesheet or import the animation library:\n`;
  const keyframes = definition
    .getKeyframes(config)
    .split('\n')
    .map((line) => `// ${line}`)
    .join('\n');
  component += keyframes + '\n';

  return component;
}
