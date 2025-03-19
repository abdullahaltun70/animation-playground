'use client';

import React from 'react';

import { Button, Heading, Select, Slider, Theme, Text } from '@radix-ui/themes';

import styles from './config-panel.module.scss';

export function ConfigPanel() {
	return (
		<div className={styles.configPanel}>
			<h2 className={styles.title}>Config</h2>

			{/* Select Input */}
			<div className={styles.field}>
				<Text weight="bold">Type Animatie</Text>
				<br></br>
				<Select.Root defaultValue="optie1">
					<Select.Trigger />
					<Select.Content>
						<Select.Item value="optie1">Optie 1</Select.Item>
						<Select.Item value="optie2">Optie 2</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<Heading size={'3'}>Sliders</Heading>
			<Theme>
				<div className={styles.field}>
					<label>Instelling 1</label>
					<Slider defaultValue={[50]} min={0} max={100} step={1} />
				</div>

				<div className={styles.field}>
					<label>Instelling 2</label>
					<Slider defaultValue={[50]} min={0} max={100} step={1} />
				</div>

				<div className={styles.field}>
					<label>Instelling 3</label>
					<Slider defaultValue={[50]} min={0} max={100} step={1} />
				</div>
			</Theme>

			{/*	Buttons*/}
			<div className={styles.configButtons}>
				<Button className={styles.button}>Reset</Button>
				<Button className={styles.button}>Export</Button>
			</div>
		</div>
	);
}
