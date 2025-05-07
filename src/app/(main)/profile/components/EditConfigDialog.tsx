// src/components/profile/EditConfigDialog.tsx
import React, { useState } from 'react';

import * as Form from '@radix-ui/react-form';
import { Button, Flex, Spinner, TextArea, TextField } from '@radix-ui/themes';

import type { Config } from '@/db/schema';

interface EditConfigProps {
  config: Config;
  onSave: (updatedData: Partial<Config>) => Promise<void>;
  onCancel: () => void;
}

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
    // Creëer een object met alleen de daadwerkelijk *gewijzigde* velden
    const changedData: Partial<Config> = {};

    if (formData.title !== config.title) {
      changedData.title = formData.title;
    }
    if (formData.description !== (config.description ?? '')) {
      // Stuur null als het leeg is gemaakt, of de nieuwe waarde
      changedData.description = formData.description || null;
    }
    if (formData.configData !== (config.configData ?? '')) {
      // Stuur null als het leeg is gemaakt, of de nieuwe waarde
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
        e.preventDefault(); // Voorkom standaard form submit
        handleSave();
      }}
    >
      <Flex direction="column" gap="3">
        {' '}
        {/* Gebruik Flex voor layout */}
        <Form.Field name="title" className="FormField">
          <Form.Label className="FormLabel">Title</Form.Label>
          <Form.Control asChild>
            <TextField.Root // Gebruik Radix TextField
              name="title" // Belangrijk voor state update
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
            <TextArea // Gebruik Radix TextArea
              name="description" // Belangrijk voor state update
              value={formData.description ?? ''}
              onChange={handleChange}
              placeholder="Optional description"
              rows={3} // Bepaal hoogte
              style={{ minHeight: 80 }} // Zorgt voor minimale hoogte
            />
          </Form.Control>
        </Form.Field>
        <Form.Field name="configData" className="FormField">
          <Form.Label className="FormLabel">Config Data</Form.Label>
          <Form.Control asChild>
            <TextArea
              name="configData" // Belangrijk voor state update
              value={formData.configData ?? ''}
              onChange={handleChange}
              placeholder="Enter configuration data here..."
              rows={6} // Meer ruimte voor data
              style={{ minHeight: 120 }} // Zorgt voor minimale hoogte
            />
          </Form.Control>
        </Form.Field>
      </Flex>

      {/* Actie knoppen onderaan de dialog */}
      <Flex gap="3" mt="4" justify="end">
        <Button
          variant="soft"
          color="gray"
          onClick={onCancel}
          type="button"
          // Gebruik de isSaving state van DEZE component
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Form.Submit asChild>
          {/* Gebruik de isSaving state van DEZE component */}
          <Button disabled={isSaving} type="submit">
            {/* Optioneel: Spinner tonen gebaseerd op isSaving */}
            {isSaving && <Spinner size="1" mr="1" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Form.Submit>
      </Flex>
    </Form.Root>
  );
};

export default EditConfigDialog;
