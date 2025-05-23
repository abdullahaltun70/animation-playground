import React from 'react';

import { Theme } from '@radix-ui/themes';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ConfigCard } from '@/components/config-card/ConfigCard';
import type { ConfigModel } from '@/types/animations'; // Using actual type

// Mock next/navigation
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

// Mock Radix Icons (optional, but can prevent warnings/errors if icons have complex internals)
vi.mock('@radix-ui/react-icons', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@radix-ui/react-icons')>();
  return {
    ...original,
    EyeOpenIcon: () => <svg data-testid="icon-eye-open" />,
    LockClosedIcon: () => <svg data-testid="icon-lock-closed" />,
    Pencil2Icon: () => <svg data-testid="icon-pencil" />,
    Share1Icon: () => <svg data-testid="icon-share" />,
    TrashIcon: () => <svg data-testid="icon-trash" />,
    CalendarIcon: () => <svg data-testid="icon-calendar" />,
    PersonIcon: () => <svg data-testid="icon-person" />,
  };
});

describe('ConfigCard Component', () => {
  const mockOnDeleteAction = vi.fn();
  const mockOnShareAction = vi.fn();

  const baseConfig: ConfigModel = {
    id: 'cfg1',
    title: 'Test Config Title',
    description: 'This is a test description.',
    configData: '{}', // Not directly used by card display logic
    isPublic: true,
    createdAt: new Date('2023-10-26T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2023-10-27T10:00:00.000Z').toISOString(),
    userId: 'user123',
    authorName: 'Author TestUser', // Added authorName
  };

  const renderConfigCard = (
    props: Partial<React.ComponentProps<typeof ConfigCard>>
  ) => {
    const defaultProps: React.ComponentProps<typeof ConfigCard> = {
      config: baseConfig,
      authorName: baseConfig.authorName || 'Unknown User', // Ensure authorName is always passed
      onDeleteAction: mockOnDeleteAction,
      onShareAction: mockOnShareAction,
    };
    return render(
      <Theme>
        {' '}
        {/* Radix UI Theme provider */}
        <ConfigCard {...defaultProps} {...props} />
      </Theme>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Content', () => {
    it('should display the title, description, author name, and formatted creation date', () => {
      renderConfigCard({});
      expect(screen.getByText('Test Config Title')).toBeInTheDocument();
      expect(
        screen.getByText('This is a test description.')
      ).toBeInTheDocument();
      expect(screen.getByText(`@${baseConfig.authorName}`)).toBeInTheDocument(); // authorName from baseConfig
      // Assuming toLocaleDateString for 'en-US' with these options for '2023-10-26T10:00:00.000Z'
      // This might be locale-dependent in the test environment.
      // A more robust way would be to mock toLocaleDateString or check parts of the date.
      // For now, checking for a reasonable substring or structure.
      // Default format: Oct 26, 2023 (in en-US)
      expect(
        screen.getByText((content) => content.startsWith('Oct 26, 2023'))
      ).toBeInTheDocument();
    });

    it('should display "No description provided." if description is null or empty', () => {
      renderConfigCard({ config: { ...baseConfig, description: undefined } });
      expect(
        screen.getAllByText('No description provided.').length
      ).toBeGreaterThan(0);

      renderConfigCard({ config: { ...baseConfig, description: '' } });
      expect(
        screen.getAllByText('No description provided.').length
      ).toBeGreaterThan(0);
    });

    it('should display "Untitled Configuration" if title is null or empty', () => {
      renderConfigCard({ config: { ...baseConfig, title: '' } });
      expect(
        screen.getAllByText('Untitled Configuration').length
      ).toBeGreaterThan(0);

      renderConfigCard({ config: { ...baseConfig, title: '' } });
      expect(
        screen.getAllByText('Untitled Configuration').length
      ).toBeGreaterThan(0);
    });

    it('should handle invalid date string gracefully for creation date', () => {
      renderConfigCard({
        config: { ...baseConfig, createdAt: 'invalid-date-string' },
      });
      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });

    it('should display "Public" and EyeOpenIcon if config.isPublic is true', () => {
      renderConfigCard({ config: { ...baseConfig, isPublic: true } });
      expect(screen.getByText('Public')).toBeInTheDocument();
      expect(screen.getByTestId('icon-eye-open')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-lock-closed')).not.toBeInTheDocument();
    });

    it('should display "Private" and LockClosedIcon if config.isPublic is false', () => {
      renderConfigCard({ config: { ...baseConfig, isPublic: false } });
      expect(screen.getByText('Private')).toBeInTheDocument();
      expect(screen.getByTestId('icon-lock-closed')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-eye-open')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should always render the Edit button and call router.push on click', async () => {
      const user = userEvent.setup();
      renderConfigCard({});
      const editButton = screen.getByRole('button', { name: /edit/i }); // Match text containing "Edit"
      expect(editButton).toBeInTheDocument();
      await user.click(editButton);
      expect(mockRouterPush).toHaveBeenCalledWith(
        `/playground?id=${baseConfig.id}`
      );
    });

    describe('Share Button', () => {
      it('should render Share button and call onShareAction if prop is provided', async () => {
        const user = userEvent.setup();
        renderConfigCard({ onShareAction: mockOnShareAction }); // Explicitly provide it
        const shareButton = screen.getByRole('button', { name: /share/i });
        expect(shareButton).toBeInTheDocument();
        await user.click(shareButton);
        expect(mockOnShareAction).toHaveBeenCalledWith(baseConfig.id);
      });

      it('should not render Share button if onShareAction prop is not provided', () => {
        renderConfigCard({ onShareAction: undefined });
        expect(
          screen.queryByRole('button', { name: /share/i })
        ).not.toBeInTheDocument();
      });
    });

    describe('Delete Button', () => {
      it('should render Delete button and call onDeleteAction if prop is provided', async () => {
        const user = userEvent.setup();
        renderConfigCard({ onDeleteAction: mockOnDeleteAction }); // Explicitly provide it
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        expect(deleteButton).toBeInTheDocument();
        await user.click(deleteButton);
        expect(mockOnDeleteAction).toHaveBeenCalledWith(baseConfig.id);
      });

      it('should not render Delete button if onDeleteAction prop is not provided', () => {
        renderConfigCard({ onDeleteAction: undefined });
        expect(
          screen.queryByRole('button', { name: /delete/i })
        ).not.toBeInTheDocument();
      });
    });
  });
});
