import React, { useState } from 'react';

import * as Form from '@radix-ui/react-form';
import { Button, Flex, Spinner, TextArea, TextField } from '@radix-ui/themes';

import type { Config } from '@/db/schema';

interface EditConfigProps {
  config: Config;
  onSave: (updatedData: Partial<Config>) => Promise<void>;
  onCancel: () => void;
}

/**
 * A dialog component for editing an existing configuration.
 * It allows users to modify the title, description, and configuration data.
 */
const EditConfigDialog = ({ config, onSave, onCancel }: EditConfigProps) => {
  const [formData, setFormData] = useState<Partial<Config>>({
    title: config.title,
    description: config.description ?? '',
    configData: config.configData ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Create an object with only the fields that have actually *changed*
    const changedData: Partial<Config> = {};

    if (formData.title !== config.title) {
      changedData.title = formData.title;
    }
    if (formData.description !== (config.description ?? '')) {
      // Send null if it was cleared, or the new value
      changedData.description = formData.description || null;
    }
    if (formData.configData !== (config.configData ?? '')) {
      // Send null if it was cleared, or the new value
      changedData.configData = formData.configData || null;
    }

    try {
      if (Object.keys(changedData).length > 0) {
        await onSave(changedData);
      } else {
        onCancel();
      }
    } catch (error) {
      console.error('Error during onSave callback in EditConfigDialog:', error);
    } finally {
      setIsSaving(false);
      onCancel();
    }
  };

  return (
    <Form.Root
      onSubmit={(e) => {
        e.preventDefault(); // Prevent default form submission
        handleSave();
      }}
    >
      <Flex direction="column" gap="3">
        {/* Using Flex for layout */}
        <Form.Field name="title" className="FormField">
          <Form.Label className="FormLabel">Title</Form.Label>
          <Form.Control asChild>
            <TextField.Root // Using Radix TextField
              name="title" // Important for state update
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Configuration Title"
            />
          </Form.Control>
          <Form.Message match="valueMissing">
            Title cannot be empty!
          </Form.Message>
        </Form.Field>
        <Form.Field name="description" className="FormField">
          <Form.Label className="FormLabel">Description</Form.Label>
          <Form.Control asChild>
            <TextArea // Using Radix TextArea
              name="description" // Important for state update
              value={formData.description ?? ''}
              onChange={handleChange}
              placeholder="Optional description"
              rows={3} // Set initial height
              style={{ minHeight: 80 }} // Ensures minimum height
            />
          </Form.Control>
        </Form.Field>
        <Form.Field name="configData" className="FormField">
          <Form.Label className="FormLabel">Config Data</Form.Label>
          <Form.Control asChild>
            <TextArea
              name="configData" // Important for state update
              value={formData.configData ?? ''}
              onChange={handleChange}
              placeholder="Enter configuration data here..."
              rows={6} // More space for data
              style={{ minHeight: 120 }} // Ensures minimum height
            />
          </Form.Control>
        </Form.Field>
      </Flex>

      {/* Action buttons at the bottom of the dialog */}
      <Flex gap="3" mt="4" justify="end">
        <Button
          variant="soft"
          color="gray"
          onClick={onCancel}
          type="button"
          // Use the isSaving state from THIS component
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Form.Submit asChild>
          {/* Use the isSaving state from THIS component */}
          <Button disabled={isSaving} type="submit">
            {/* Optional: Show spinner based on isSaving */}
            {isSaving && <Spinner size="1" mr="1" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Form.Submit>
      </Flex>
    </Form.Root>
  );
};

export default EditConfigDialog;
