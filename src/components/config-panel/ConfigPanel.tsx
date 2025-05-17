// src/components/config-panel/ConfigPanel.tsx
import React, { useEffect, useId, useState } from 'react'; // Added useId

import * as LabelPrimitive from '@radix-ui/react-label';
import {
  Button,
  Flex,
  Heading,
  Select,
  Slider,
  Text,
  TextField,
  Theme,
} from '@radix-ui/themes';

import { VisibilitySwitch } from '@/components/config-panel/VisibilitySwitch';
import {
  AnimationConfig,
  AnimationType,
  EasingFunction,
} from '@/types/animations';

import styles from './ConfigPanel.module.scss';

interface ConfigPanelProps {
  initialConfig?: AnimationConfig;
  onConfigChange?: (config: AnimationConfig) => void;
  onSave?: (config: AnimationConfig) => void;
  onReset?: () => void;
  isReadOnly?: boolean;
  saveButtonText?: string;
}

export function ConfigPanel({
  initialConfig,
  onConfigChange,
  onSave,
  onReset,
  isReadOnly = false,
  saveButtonText = 'Save',
}: ConfigPanelProps) {
  const [config, setConfig] = useState<AnimationConfig>(
    initialConfig || {
      type: 'fade',
      duration: 0.5,
      delay: 0,
      easing: 'ease-out',
      distance: 50,
      degrees: 360,
      scale: 0.8,
      opacity: {
        start: 0,
        end: 1,
      },
      name: '',
      description: '',
      isPublic: false,
    }
  );

  const [isPublic, setIsPublic] = useState<boolean>(config.isPublic || false);

  // Unique IDs for associating labels
  const nameInputId = React.useId();
  const descriptionInputId = React.useId();

  // Generate unique IDs for accessibility
  const nameLabelId = useId();
  const descriptionLabelId = useId();
  const animationTypeLabelId = useId();
  const easingFunctionLabelId = useId();
  const durationLabelId = useId();
  const delayLabelId = useId();
  const startOpacityLabelId = useId();
  const endOpacityLabelId = useId();
  const distanceLabelId = useId();
  const scaleLabelId = useId();
  const rotationLabelId = useId();
  const visibilityLabelId = useId();

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      setIsPublic(initialConfig.isPublic || false);
    }
  }, [initialConfig]);

  const handleChange = (
    key: keyof AnimationConfig,
    value: string | number | boolean | AnimationType | EasingFunction
  ) => {
    if (isReadOnly) return;
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    if (key !== 'name' && key !== 'description' && onConfigChange) {
      onConfigChange(newConfig);
    }
  };

  const handleOpacityChange = (key: 'start' | 'end', value: number) => {
    if (isReadOnly) return;
    setConfig((prev) => ({
      ...prev,
      opacity: {
        ...(prev.opacity || { start: 0, end: 1 }),
        [key]: value / 100,
      },
    }));
  };

  const handleReset = () => {
    if (!isReadOnly) {
      const resetConfig: AnimationConfig = {
        type: 'fade',
        duration: 0.5,
        delay: 0,
        easing: 'ease-out',
        distance: 50,
        degrees: 360,
        scale: 0.8,
        opacity: { start: 0, end: 1 },
        name: '',
        description: '',
        isPublic: false,
      };
      setConfig(resetConfig);
      setIsPublic(false);
    }
    if (onReset) onReset();
  };

  const handleSave = () => {
    const updatedConfig = { ...config, isPublic };
    if (!isReadOnly && onConfigChange) onConfigChange(updatedConfig);
    if (onSave) onSave(updatedConfig);
  };

  return (
    <>
      <h2 className={styles.title}>Animation Configuration</h2>
      <div className={styles.configPanel}>
        <div className={styles.field}>
          <LabelPrimitive.Root id={nameLabelId} htmlFor={nameInputId}>
            {' '}
            {/* Give Label an ID */}
            <Text weight="bold">Configuration Name</Text>
          </LabelPrimitive.Root>
          <TextField.Root
            id={nameInputId}
            aria-labelledby={nameLabelId} // Explicitly label
            placeholder="My Animation"
            value={config.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        <div className={styles.field}>
          <LabelPrimitive.Root
            id={descriptionLabelId}
            htmlFor={descriptionInputId}
          >
            <Text weight="bold">Description</Text>
          </LabelPrimitive.Root>
          <TextField.Root
            id={descriptionInputId}
            aria-labelledby={descriptionLabelId} // Explicitly label
            placeholder="Describe your animation"
            value={config.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        <div className={styles.field}>
          <Flex gap="1" direction={'column'}>
            <LabelPrimitive.Root id={animationTypeLabelId}>
              {' '}
              {/* ID for labelling */}
              <Text weight="bold">Animation Type</Text>
            </LabelPrimitive.Root>
            <Select.Root
              value={config.type}
              onValueChange={(value) =>
                handleChange('type', value as AnimationType)
              }
              disabled={isReadOnly}
            >
              <Select.Trigger
                aria-labelledby={animationTypeLabelId}
                placeholder="Select animation type"
              />{' '}
              {/* Label trigger */}
              <Select.Content>
                <Select.Item value="fade">Fade</Select.Item>
                <Select.Item value="slide">Slide</Select.Item>
                <Select.Item value="scale">Scale</Select.Item>
                <Select.Item value="rotate">Rotate</Select.Item>
                <Select.Item value="bounce">Bounce</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </div>

        <div className={styles.field}>
          <Flex gap="1" direction={'column'}>
            <LabelPrimitive.Root id={easingFunctionLabelId}>
              <Text weight="bold">Easing Function</Text>
            </LabelPrimitive.Root>
            <Select.Root
              value={config.easing}
              onValueChange={(value) =>
                handleChange('easing', value as EasingFunction)
              }
              disabled={isReadOnly}
            >
              <Select.Trigger
                aria-labelledby={easingFunctionLabelId}
                placeholder="Select easing function"
              />
              <Select.Content>
                <Select.Item value="ease">Ease</Select.Item>
                <Select.Item value="ease-in">Ease In</Select.Item>
                <Select.Item value="ease-out">Ease Out</Select.Item>
                <Select.Item value="ease-in-out">Ease In Out</Select.Item>
                <Select.Item value="linear">Linear</Select.Item>
                <Select.Item value="cubic-bezier(0.175, 0.885, 0.32, 1.275)">
                  Elastic
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </div>

        <Heading size={'3'}>Animation Parameters</Heading>
        <Theme>
          <div className={styles.field}>
            <LabelPrimitive.Root id={durationLabelId}>
              {' '}
              {/* Label has ID */}
              Duration (seconds)
            </LabelPrimitive.Root>
            <Slider
              aria-labelledby={durationLabelId} // Slider.Root is labelled by this
              value={[config.duration * 10]}
              min={1}
              max={30}
              step={1}
              onValueChange={(value) => handleChange('duration', value[0] / 10)}
              disabled={isReadOnly}
            />
            <Text size="1">{config.duration.toFixed(1)}s</Text>
          </div>

          <div className={styles.field}>
            <LabelPrimitive.Root id={delayLabelId}>
              Delay (seconds)
            </LabelPrimitive.Root>
            <Slider
              aria-labelledby={delayLabelId}
              value={[config.delay * 10]}
              min={0}
              max={20}
              step={1}
              onValueChange={(value) => handleChange('delay', value[0] / 10)}
              disabled={isReadOnly}
            />
            <Text size="1">{config.delay.toFixed(1)}s</Text>
          </div>

          {config.type === 'fade' && (
            <>
              <div className={styles.field}>
                <LabelPrimitive.Root id={startOpacityLabelId}>
                  Start Opacity
                </LabelPrimitive.Root>
                <Slider
                  aria-labelledby={startOpacityLabelId}
                  value={[config.opacity ? config.opacity.start * 100 : 0]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) =>
                    handleOpacityChange('start', value[0])
                  }
                  disabled={isReadOnly}
                />
                <Text size="1">
                  {`${config.opacity ? (config.opacity.start * 100).toFixed(0) : 0}%`}
                </Text>
              </div>
              <div className={styles.field}>
                <LabelPrimitive.Root id={endOpacityLabelId}>
                  End Opacity
                </LabelPrimitive.Root>
                <Slider
                  aria-labelledby={endOpacityLabelId}
                  value={[config.opacity ? config.opacity.end * 100 : 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) =>
                    handleOpacityChange('end', value[0])
                  }
                  disabled={isReadOnly}
                />
                <Text size="1">
                  {`${config.opacity ? (config.opacity.end * 100).toFixed(0) : 0}%`}
                </Text>
              </div>
            </>
          )}

          {(config.type === 'slide' || config.type === 'bounce') && (
            <div className={styles.field}>
              <LabelPrimitive.Root id={distanceLabelId}>
                Distance (pixels)
              </LabelPrimitive.Root>
              <Slider
                aria-labelledby={distanceLabelId}
                value={[config.distance || 50]}
                min={-200}
                max={200}
                step={1}
                onValueChange={(value) => handleChange('distance', value[0])}
                disabled={isReadOnly}
              />
              <Text size="1">{config.distance || 50}px</Text>
            </div>
          )}

          {config.type === 'scale' && (
            <div className={styles.field}>
              <LabelPrimitive.Root id={scaleLabelId}>
                Scale Factor
              </LabelPrimitive.Root>
              <Slider
                aria-labelledby={scaleLabelId}
                value={[config.scale ? config.scale * 100 : 80]}
                min={10}
                max={200}
                step={1}
                onValueChange={(value) => handleChange('scale', value[0] / 100)}
                disabled={isReadOnly}
              />
              <Text size="1">
                {config.scale ? (config.scale * 100).toFixed(0) : 80}%
              </Text>
            </div>
          )}

          {config.type === 'rotate' && (
            <div className={styles.field}>
              <LabelPrimitive.Root id={rotationLabelId}>
                Rotation (degrees)
              </LabelPrimitive.Root>
              <Slider
                aria-labelledby={rotationLabelId}
                value={[config.degrees || 360]}
                min={-360}
                max={360}
                step={1}
                onValueChange={(value) => handleChange('degrees', value[0])}
                disabled={isReadOnly}
              />
              <Text size="1">{config.degrees || 360}°</Text>
            </div>
          )}

          <Flex direction={'column'} className={styles.field} gap="1">
            <LabelPrimitive.Root id={visibilityLabelId}>
              {' '}
              {/* Changed ID to avoid clash if useId not scoped */}
              Visibility
            </LabelPrimitive.Root>
            <VisibilitySwitch
              aria-label={'Visibility'}
              isPublic={isPublic}
              onChange={(newIsPublicValue) => {
                setIsPublic(newIsPublicValue);
                handleChange('isPublic', newIsPublicValue);
              }}
              disabled={isReadOnly}
            />
          </Flex>
        </Theme>

        <div className={styles.configButtons}>
          <Button className={styles.button} onClick={handleReset}>
            {isReadOnly ? 'New Animation' : 'Reset'}
          </Button>
          <Button className={styles.copyButton} onClick={handleSave}>
            {saveButtonText}
          </Button>
        </div>
      </div>
    </>
  );
}
