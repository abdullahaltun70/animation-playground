/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useId, useState, useRef } from 'react';

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

/**
 * @interface ConfigPanelProps
 * @description Defines the props for the ConfigPanel component.
 * @property {AnimationConfig} [initialConfig] - The initial configuration to populate the panel.
 * @property {(config: AnimationConfig) => void} [onConfigChange] - Callback fired when any configuration value changes (excluding name/description, which are part of save).
 * @property {(config: AnimationConfig) => void} [onSave] - Callback fired when the save button is clicked.
 * @property {() => void} [onReset] - Callback fired when the reset button is clicked.
 * @property {boolean} [isReadOnly=false] - If true, disables editing of configuration options.
 * @property {string} [saveButtonText='Save'] - Text to display on the save button.
 */
interface ConfigPanelProps {
  initialConfig?: AnimationConfig;
  onConfigChange?: (config: AnimationConfig) => void;
  onSave?: (config: AnimationConfig) => void;
  onReset?: () => void;
  isReadOnly?: boolean;
  saveButtonText?: string;
}

/**
 * @component ConfigPanel
 * @description A comprehensive panel for configuring various animation properties.
 * It allows users to define animation types, durations, delays, easing functions,
 * and type-specific parameters like opacity, distance, scale, and rotation.
 * It also includes fields for naming and describing the configuration, and controls for saving and resetting.
 * The panel can be set to a read-only mode.
 * @param {ConfigPanelProps} props - The props for the component.
 */
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
      axis: 'x',
      name: '',
      description: '',
      isPublic: false,
    }
  );

  const [isPublic, setIsPublic] = useState<boolean>(config.isPublic || false);

  const nameInputId = React.useId(); // Unique ID for name input
  const descriptionInputId = React.useId(); // Unique ID for description input

  // Generate unique IDs for accessibility attributes (aria-labelledby)
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
  const visibilityLabelId = useId();
  const axisLabelId = useId();
  const startRotationLabelId = useId(); // New ID for start rotation
  const endRotationLabelId = useId(); // New ID for end rotation

  const prevConfigRef = useRef<AnimationConfig | undefined>(initialConfig);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      setIsPublic(initialConfig.isPublic || false);
      prevConfigRef.current = initialConfig; // Initialize prevConfigRef
    }
  }, [initialConfig]);

  // Effect to propagate changes upwards via onConfigChange,
  // excluding name and description which are typically part of a save action.
  useEffect(() => {
    if (onConfigChange && !isReadOnly) {
      const { name, description, ...restOfConfig } = config;
      const {
        name: prevName,
        description: prevDescription,
        ...restOfPrevConfig
      } = prevConfigRef.current || { name: '', description: '' };

      // Deep comparison for the rest of the config to avoid unnecessary calls
      if (JSON.stringify(restOfConfig) !== JSON.stringify(restOfPrevConfig)) {
        onConfigChange(config); // Propagate the full config state
      }
    }
    prevConfigRef.current = config; // Update ref after processing
  }, [config, isReadOnly, onConfigChange]);

  // Generic handler for most config changes.
  // Direct onConfigChange calls were removed from here to be centralized in the useEffect.
  const handleChange = (
    key: keyof AnimationConfig,
    value: string | number | boolean | AnimationType | EasingFunction
  ) => {
    if (isReadOnly) return;
    setConfig((prevConfig) => ({ ...prevConfig, [key]: value }));
  };

  // Specific handler for opacity changes.
  const handleOpacityChange = (key: 'start' | 'end', value: number) => {
    if (isReadOnly) return;
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        opacity: {
          ...(prev.opacity || { start: 0, end: 1 }), // Ensure opacity object exists
          [key]: value / 100, // Convert percentage to decimal
        },
      };
      return newConfig;
    });
  };

  // Resets the configuration to default values.
  // Calls onReset prop if provided, regardless of read-only state (as per test expectations).
  const handleReset = () => {
    if (!isReadOnly) {
      const resetConfigData: AnimationConfig = {
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
        axis: 'x',
      };
      setConfig(resetConfigData);
      setIsPublic(false);
    }
    if (onReset) {
      onReset();
    }
  };

  // Handles saving the configuration.
  // Calls onSave prop. Also calls onConfigChange if not read-only (as per test expectations).
  const handleSave = () => {
    const configToSave =
      isReadOnly && initialConfig ? initialConfig : { ...config, isPublic };
    if (onSave) {
      onSave(configToSave);
    }
    if (!isReadOnly && onConfigChange) {
      onConfigChange({ ...config, isPublic });
    }
  };

  // Specific handler for rotation degrees (start/end).
  const handleDegreesChange = (key: 'start' | 'end', value: number) => {
    if (isReadOnly) return;
    setConfig((prev) => {
      const currentDegrees = prev.degrees;
      let newDegreesState: number | { start: number; end: number };

      // Handle conversion from simple number to object if necessary
      if (typeof currentDegrees === 'object') {
        newDegreesState = { ...currentDegrees, [key]: value };
      } else {
        // If currentDegrees is a number, initialize as object
        if (key === 'start') {
          newDegreesState = {
            start: value,
            end: typeof currentDegrees === 'number' ? currentDegrees : 360, // Default end if was number
          };
        } else {
          // key === 'end'
          newDegreesState = {
            start: 0, // Default start
            end: value,
          };
        }
      }
      const newConfig = { ...prev, degrees: newDegreesState };
      return newConfig;
    });
  };

  return (
    <>
      <h2 className={styles.title}>Animation Configuration</h2>
      <div className={styles.configPanel} data-cy="config-panel">
        <div className={styles.field}>
          <LabelPrimitive.Root id={nameLabelId} htmlFor={nameInputId}>
            <Text weight="bold">Configuration Name</Text>
          </LabelPrimitive.Root>
          <TextField.Root
            id={nameInputId}
            aria-labelledby={nameLabelId}
            placeholder="My Animation"
            value={config.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={isReadOnly}
            data-cy="animation-name-input"
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
            aria-labelledby={descriptionLabelId}
            placeholder="Describe your animation"
            value={config.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={isReadOnly}
            data-cy="animation-description-input"
          />
        </div>

        <div className={styles.field}>
          <Flex gap="1" direction={'column'}>
            <LabelPrimitive.Root id={animationTypeLabelId}>
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
                data-cy="animation-type-trigger"
              />
              <Select.Content>
                <Select.Item value="fade" data-cy="animation-type-fade">
                  Fade
                </Select.Item>
                <Select.Item value="slide" data-cy="animation-type-slide">
                  Slide
                </Select.Item>
                <Select.Item value="scale" data-cy="animation-type-scale">
                  Scale
                </Select.Item>
                <Select.Item value="rotate" data-cy="animation-type-rotate">
                  Rotate
                </Select.Item>
                <Select.Item value="bounce" data-cy="animation-type-bounce">
                  Bounce
                </Select.Item>
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
                data-cy="easing-trigger"
              />
              <Select.Content>
                <Select.Item value="ease" data-cy="easing-ease">
                  Ease
                </Select.Item>
                <Select.Item value="ease-in" data-cy="easing-ease-in">
                  Ease In
                </Select.Item>
                <Select.Item value="ease-out" data-cy="easing-ease-out">
                  Ease Out
                </Select.Item>
                <Select.Item value="ease-in-out" data-cy="easing-ease-in-out">
                  Ease In Out
                </Select.Item>
                <Select.Item value="linear" data-cy="easing-linear">
                  Linear
                </Select.Item>
                <Select.Item
                  value="cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                  data-cy="easing-elastic"
                >
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
              Duration (seconds)
            </LabelPrimitive.Root>
            <Slider
              aria-labelledby={durationLabelId}
              value={[config.duration * 10]} // Multiply by 10 for slider precision
              min={1} // Represents 0.1s
              max={30} // Represents 3.0s
              step={1}
              onValueChange={(value) => handleChange('duration', value[0] / 10)}
              disabled={isReadOnly}
              data-cy="duration-slider"
            />
            <Text size="1">{config.duration.toFixed(1)}s</Text>
          </div>

          <div className={styles.field}>
            <LabelPrimitive.Root id={delayLabelId}>
              Delay (seconds)
            </LabelPrimitive.Root>
            <Slider
              aria-labelledby={delayLabelId}
              value={[config.delay * 10]} // Multiply by 10 for slider precision
              min={0} // Represents 0.0s
              max={20} // Represents 2.0s
              step={1}
              onValueChange={(value) => handleChange('delay', value[0] / 10)}
              disabled={isReadOnly}
              data-cy="delay-slider"
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
                  value={[config.opacity ? config.opacity.start * 100 : 0]} // Value in percentage
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) =>
                    handleOpacityChange('start', value[0])
                  }
                  disabled={isReadOnly}
                  data-cy="start-opacity-slider"
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
                  value={[config.opacity ? config.opacity.end * 100 : 100]} // Value in percentage
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) =>
                    handleOpacityChange('end', value[0])
                  }
                  disabled={isReadOnly}
                  data-cy="end-opacity-slider"
                />
                <Text size="1">
                  {`${config.opacity ? (config.opacity.end * 100).toFixed(0) : 100}%`}
                </Text>
              </div>
            </>
          )}

          {config.type === 'slide' && (
            <>
              <div className={styles.field}>
                <LabelPrimitive.Root id={distanceLabelId}>
                  Distance (pixels)
                </LabelPrimitive.Root>
                <Slider
                  aria-labelledby={distanceLabelId}
                  value={[config.distance || 0]}
                  min={-200}
                  max={200}
                  step={1}
                  onValueChange={(value) => handleChange('distance', value[0])}
                  disabled={isReadOnly}
                  data-cy="distance-input"
                />
                <Text size="1">{`${config.distance || 0}px`}</Text>
              </div>
              <div className={styles.field}>
                <Flex gap="1" direction={'column'}>
                  <LabelPrimitive.Root id={axisLabelId}>
                    <Text weight="bold">Axis</Text>
                  </LabelPrimitive.Root>
                  <Select.Root
                    value={config.axis || 'x'}
                    onValueChange={(value) =>
                      handleChange('axis', value as 'x' | 'y')
                    }
                    disabled={isReadOnly}
                  >
                    <Select.Trigger
                      aria-labelledby={axisLabelId}
                      placeholder="Select axis"
                      data-cy="axis-trigger"
                    />
                    <Select.Content>
                      <Select.Item value="x" data-cy="axis-x">
                        X-axis
                      </Select.Item>
                      <Select.Item value="y" data-cy="axis-y">
                        Y-axis
                      </Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </div>
            </>
          )}

          {config.type === 'scale' && (
            <>
              <div className={styles.field}>
                <LabelPrimitive.Root id={scaleLabelId}>
                  Scale
                </LabelPrimitive.Root>
                <Slider
                  aria-labelledby={scaleLabelId}
                  value={[config.scale ? config.scale * 100 : 0]} // Value in percentage
                  min={0} // Represents 0%
                  max={200} // Represents 200%
                  step={1}
                  onValueChange={(value) =>
                    handleChange('scale', value[0] / 100)
                  }
                  disabled={isReadOnly}
                  data-cy="scale-input"
                />
                <Text size="1">
                  {`${config.scale ? (config.scale * 100).toFixed(0) : 0}%`}
                </Text>
              </div>
            </>
          )}

          {config.type === 'rotate' && (
            <>
              <div className={styles.field}>
                <LabelPrimitive.Root id={startRotationLabelId}>
                  Start Rotation (degrees)
                </LabelPrimitive.Root>
                <Slider
                  aria-labelledby={startRotationLabelId}
                  value={[
                    typeof config.degrees === 'object'
                      ? config.degrees.start
                      : 0, // Default start rotation to 0 if not an object
                  ]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={(value) =>
                    handleDegreesChange('start', value[0])
                  }
                  disabled={isReadOnly}
                  data-cy="start-degrees-input"
                />
                <Text size="1">
                  {typeof config.degrees === 'object'
                    ? config.degrees.start
                    : 0}
                  °
                </Text>
              </div>
              <div className={styles.field}>
                <LabelPrimitive.Root id={endRotationLabelId}>
                  End Rotation (degrees)
                </LabelPrimitive.Root>
                <Slider
                  aria-labelledby={endRotationLabelId}
                  value={[
                    typeof config.degrees === 'object'
                      ? config.degrees.end
                      : typeof config.degrees === 'number'
                        ? config.degrees // Use number if it's the simple type
                        : 360, // Default end rotation
                  ]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={(value) =>
                    handleDegreesChange('end', value[0])
                  }
                  disabled={isReadOnly}
                  data-cy="degrees-input"
                />
                <Text size="1">
                  {typeof config.degrees === 'object'
                    ? config.degrees.end
                    : typeof config.degrees === 'number'
                      ? config.degrees
                      : 360}
                  °
                </Text>
              </div>
            </>
          )}

          {config.type === 'bounce' && (
            <>
              <div className={styles.field}>
                <LabelPrimitive.Root id={distanceLabelId}>
                  Distance (pixels)
                </LabelPrimitive.Root>
                <Slider
                  aria-labelledby={distanceLabelId}
                  value={[config.distance || 0]}
                  min={-200}
                  max={200}
                  step={1}
                  onValueChange={(value) => handleChange('distance', value[0])}
                  disabled={isReadOnly}
                  data-cy="bounce-distance-input"
                />
                <Text size="1">{`${config.distance || 0}px`}</Text>
              </div>
            </>
          )}

          <Flex direction={'column'} className={styles.field} gap="1">
            <LabelPrimitive.Root id={visibilityLabelId}>
              Visibility
            </LabelPrimitive.Root>
            <VisibilitySwitch
              aria-label={'Configuration visibility'} // More descriptive aria-label
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
          <Button
            onClick={handleReset}
            variant="outline"
            className={styles.resetButton}
            disabled={isReadOnly && typeof onReset !== 'function'}
            data-cy="reset-btn"
          >
            {isReadOnly ? 'New Animation' : 'Reset'}
          </Button>
          <Button
            onClick={handleSave}
            className={styles.copyButton}
            disabled={isReadOnly && typeof onSave !== 'function'}
            data-cy="save-btn"
          >
            {isReadOnly
              ? saveButtonText === 'Save'
                ? 'Save as my configuration'
                : saveButtonText
              : saveButtonText === 'Save'
                ? 'Save'
                : saveButtonText}
          </Button>
        </div>
      </div>
    </>
  );
}
