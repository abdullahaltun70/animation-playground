// Utility functions for animations

import { AnimationConfig } from '@/types/animations';

/**
 * Generates CSS code for the animation configuration
 */
export function generateCSSCode(config: AnimationConfig): string {
	const { type, duration, delay, easing } = config;

	let css = `.animated-element {\n`;

	// Add animation properties based on type
	switch (type) {
		case 'fade':
			css += `  animation: fadeIn ${duration}s ${easing} ${delay}s forwards;\n`;
			break;
		case 'slide':
			const direction =
				config.distance && config.distance < 0 ? 'Left' : 'Right';
			css += `  animation: slideIn${direction} ${duration}s ${easing} ${delay}s forwards;\n`;
			break;
		case 'scale':
			css += `  animation: scaleIn ${duration}s ${easing} ${delay}s forwards;\n`;
			break;
		case 'rotate':
			css += `  animation: rotateIn ${duration}s ${easing} ${delay}s forwards;\n`;
			break;
		case 'bounce':
			css += `  animation: bounceIn ${duration}s ${easing} ${delay}s forwards;\n`;
			break;
	}

	css += `}\n\n`;

	// Add keyframes based on type
	switch (type) {
		case 'fade':
			const startOpacity = config.opacity?.start ?? 0;
			const endOpacity = config.opacity?.end ?? 1;
			css += `@keyframes fadeIn {\n`;
			css += `  from { opacity: ${startOpacity}; }\n`;
			css += `  to { opacity: ${endOpacity}; }\n`;
			css += `}\n`;
			break;
		case 'slide':
			const distance = config.distance ?? 50;
			const direction = distance < 0 ? 'Left' : 'Right';
			css += `@keyframes slideIn${direction} {\n`;
			css += `  from { transform: translateX(${direction === 'Left' ? -Math.abs(distance) : Math.abs(distance)}px); }\n`;
			css += `  to { transform: translateX(0); }\n`;
			css += `}\n`;
			break;
		case 'scale':
			const scale = config.scale ?? 0.8;
			css += `@keyframes scaleIn {\n`;
			css += `  from { transform: scale(${scale}); }\n`;
			css += `  to { transform: scale(1); }\n`;
			css += `}\n`;
			break;
		case 'rotate':
			const degrees = config.degrees ?? 360;
			css += `@keyframes rotateIn {\n`;
			css += `  from { transform: rotate(${degrees}deg); }\n`;
			css += `  to { transform: rotate(0); }\n`;
			css += `}\n`;
			break;
		case 'bounce':
			const height = config.distance ?? 30;
			css += `@keyframes bounceIn {\n`;
			css += `  0% { transform: translateY(0); }\n`;
			css += `  50% { transform: translateY(-${height}px); }\n`;
			css += `  100% { transform: translateY(0); }\n`;
			css += `}\n`;
			break;
	}

	return css;
}

/**
 * Generates React component code for the animation configuration
 */
export function generateReactComponent(config: AnimationConfig): string {
	const { type, duration, delay, easing } = config;

	let component = `import React from 'react';\n\n`;
	component += `// Animation component generated from ${config.name || 'Animation Playground'}\n`;
	component += `export const AnimatedElement = ({ children }) => {\n`;
	component += `  const style = {\n`;
	component += `    animation: '`;

	// Add animation properties based on type
	switch (type) {
		case 'fade':
			(component += `fadeIn ${duration}s ${easing} ${delay}s forwards`),
				(component += `',\n  };\n\n`);

			// Add keyframes
			component += `  // Add this CSS to your stylesheet:\n`;
			component += `  // @keyframes fadeIn {\n`;
			component += `  //   from { opacity: ${config.opacity?.start ?? 0}; }\n`;
			component += `  //   to { opacity: ${config.opacity?.end ?? 1}; }\n`;
			component += `  // }\n`;
			break;
		case 'slide':
			const direction =
				config.distance && config.distance < 0 ? 'Left' : 'Right';
			(component += `slideIn${direction} ${duration}s ${easing} ${delay}s forwards`),
				(component += `',\n  };\n\n`);

			// Add keyframes
			component += `  // Add this CSS to your stylesheet:\n`;
			component += `  // @keyframes slideIn${direction} {\n`;
			component += `  //   from { transform: translateX(${direction === 'Left' ? -Math.abs(config.distance ?? 50) : Math.abs(config.distance ?? 50)}px); }\n`;
			component += `  //   to { transform: translateX(0); }\n`;
			component += `  // }\n`;
			break;
		case 'scale':
			(component += `scaleIn ${duration}s ${easing} ${delay}s forwards`),
				(component += `',\n  };\n\n`);

			// Add keyframes
			component += `  // Add this CSS to your stylesheet:\n`;
			component += `  // @keyframes scaleIn {\n`;
			component += `  //   from { transform: scale(${config.scale ?? 0.8}); }\n`;
			component += `  //   to { transform: scale(1); }\n`;
			component += `  // }\n`;
			break;
		case 'rotate':
			(component += `rotateIn ${duration}s ${easing} ${delay}s forwards`),
				(component += `',\n  };\n\n`);

			// Add keyframes
			component += `  // Add this CSS to your stylesheet:\n`;
			component += `  // @keyframes rotateIn {\n`;
			component += `  //   from { transform: rotate(${config.degrees ?? 360}deg); }\n`;
			component += `  //   to { transform: rotate(0); }\n`;
			component += `  // }\n`;
			break;
		case 'bounce':
			(component += `bounceIn ${duration}s ${easing} ${delay}s forwards`),
				(component += `',\n  };\n\n`);

			// Add keyframes
			component += `  // Add this CSS to your stylesheet:\n`;
			component += `  // @keyframes bounceIn {\n`;
			component += `  //   0% { transform: translateY(0); }\n`;
			component += `  //   50% { transform: translateY(-${config.distance ?? 30}px); }\n`;
			component += `  //   100% { transform: translateY(0); }\n`;
			component += `  // }\n`;
			break;
	}

	component += `  return (\n`;
	component += `    <div style={style}>\n`;
	component += `      {children}\n`;
	component += `    </div>\n`;
	component += `  );\n`;
	component += `};\n`;

	return component;
}
