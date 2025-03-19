// src/components/animations/Keyframes.tsx
import React from 'react';

interface KeyframesProps {
	name: string;
	keyframes: string;
}

export const Keyframes: React.FC<KeyframesProps> = ({ name, keyframes }) => {
	return (
		<style>
			{`@keyframes ${name} {
        ${keyframes}
      }`}
		</style>
	);
};
