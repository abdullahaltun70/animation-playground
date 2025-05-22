import { AnimationConfig } from '@/types/animations';

/**
 * @constant ANIMATION_DEFINITIONS
 * @description Defines the structure for generating CSS keyframes and animation names for different animation types.
 * Each key corresponds to an animation type (e.g., 'fade', 'slide') and contains:
 * - `name` (string, optional): The base name for the animation (e.g., 'fadeIn').
 * - `getName` (function, optional): A function to dynamically generate the animation name based on config.
 * - `getKeyframes` (function): A function that takes an `AnimationConfig` and returns the CSS @keyframes string.
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
 * @constant DEFAULTS
 * @description Default values for animation properties. These are used in `generateReactComponent`
 * to determine if a prop should be included in the generated component code (i.e., if it differs
 * from the default).
 * These values should ideally align with defaults used elsewhere, e.g., in a potential future `<Animate>` component or hook.
 */
const DEFAULTS = {
  duration: 0.5,
  delay: 0,
  easing: 'ease-out',
  opacityStart: 0,
  opacityEnd: 1,
  distance: 50,
  degrees: 360,
  scale: 0.8,
  axis: 'x',
};

/**
 * @function getAnimationName
 * @description Retrieves the appropriate animation name for a given configuration.
 * Some animation types have dynamic names based on their properties (e.g., slide direction).
 * @param {AnimationConfig} config - The animation configuration object.
 * @returns {string} The CSS animation name.
 */
function getAnimationName(config: AnimationConfig): string {
  const definition = ANIMATION_DEFINITIONS[config.type];
  if ('getName' in definition) {
    return definition.getName(config);
  }
  return definition.name;
}

/**
 * @function generateCSSCode
 * @description Generates a string containing CSS rules, including keyframes,
 * for a given animation configuration.
 * @param {AnimationConfig} config - The animation configuration object.
 * @returns {string} The complete CSS code string for the animation.
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
 * @function generateReactComponent
 * @description Generates a React component string (e.g., `<Animate type="fade" ...>`)
 * for a given animation configuration. It only includes props whose values differ
 * from the predefined `DEFAULTS`.
 * @param {AnimationConfig} config - The animation configuration object.
 * @returns {string} A string representation of the React component.
 */
export function generateReactComponent(config: AnimationConfig): string {
  const { type } = config;
  const componentName = `// ${type.charAt(0).toUpperCase() + type.slice(1)} Animation \n`;

  const propsArray: string[] = [`type="${type}"`];

  if (config.duration !== undefined && config.duration !== DEFAULTS.duration) {
    propsArray.push(`duration={${config.duration}}`);
  }
  if (config.delay !== undefined && config.delay !== DEFAULTS.delay) {
    propsArray.push(`delay={${config.delay}}`);
  }
  if (config.easing !== undefined && config.easing !== DEFAULTS.easing) {
    propsArray.push(`easing="${config.easing}"`);
  }

  if (type === 'fade') {
    if (config.opacity) {
      const startVal =
        config.opacity.start !== undefined
          ? config.opacity.start
          : DEFAULTS.opacityStart;
      const endVal =
        config.opacity.end !== undefined
          ? config.opacity.end
          : DEFAULTS.opacityEnd;
      if (
        startVal !== DEFAULTS.opacityStart ||
        endVal !== DEFAULTS.opacityEnd
      ) {
        propsArray.push(`opacity={{ start: ${startVal}, end: ${endVal} }}`);
      }
    }
  } else if (type === 'slide') {
    if (
      config.distance !== undefined &&
      config.distance !== DEFAULTS.distance
    ) {
      propsArray.push(`distance={${config.distance}}`);
    }
    if (config.axis !== undefined && config.axis !== DEFAULTS.axis) {
      propsArray.push(`axis="${config.axis}"`);
    }
  } else if (type === 'scale') {
    if (config.scale !== undefined && config.scale !== DEFAULTS.scale) {
      propsArray.push(`scale={${config.scale}}`);
    }
  } else if (type === 'rotate') {
    if (config.degrees !== undefined) {
      if (
        typeof config.degrees === 'object' &&
        config.degrees !== null &&
        !Array.isArray(config.degrees)
      ) {
        const startVal =
          typeof config.degrees.start === 'number'
            ? `start: ${config.degrees.start}`
            : null;
        const endVal =
          typeof config.degrees.end === 'number'
            ? `end: ${config.degrees.end}`
            : null;

        const degreeParts = [startVal, endVal].filter((part) => part !== null);

        if (degreeParts.length > 0) {
          const degreePropsString = degreeParts.join(', ');
          propsArray.push(`degrees={{ ${degreePropsString} }}`);
        }
      } else if (
        typeof config.degrees === 'number' &&
        config.degrees !== DEFAULTS.degrees
      ) {
        propsArray.push(`degrees={${config.degrees}}`);
      }
    }
  } else if (type === 'bounce') {
    if (
      config.distance !== undefined &&
      config.distance !== DEFAULTS.distance
    ) {
      propsArray.push(`distance={${config.distance}}`);
    }
  }

  let propsString = '';
  if (propsArray.length > 1) {
    propsString = `\n      ${propsArray.slice(1).join('\n      ')}\n    `;
  } else {
    propsString = ' ';
  }

  return `${componentName}<Animate ${propsArray[0]}${propsString}>\n    {children}\n</Animate>`;
}
