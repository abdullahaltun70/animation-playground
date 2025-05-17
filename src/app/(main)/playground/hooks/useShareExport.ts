import { useState } from 'react';

import {
  generateCSSCode,
  generateReactComponent,
} from '@/app/utils/animations';
import { AnimationConfig } from '@/types/animations';

/**
 * Custom hook to manage state and logic for sharing and exporting animation configurations.
 * @param configId - The ID of the current animation configuration, or null if new.
 */
export function useShareExport(configId: string | null) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportTab, setExportTab] = useState('react');
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the action of sharing a configuration.
   * Sets an error if no configId is present, otherwise generates a shareable URL and opens the share dialog.
   */
  const handleShare = () => {
    if (!configId) {
      setError('Please save your configuration before sharing');
      return;
    }

    // Generate shareable URL using the current window location and the configId.
    const url = new URL(window.location.href);
    url.searchParams.set('id', configId);
    setShareUrl(url.toString());
    setShareDialogOpen(true);
  };

  /**
   * Opens the export dialog.
   */
  const handleExport = () => {
    setExportDialogOpen(true);
  };

  /**
   * Copies the generated share URL to the clipboard.
   * Shows a success message or an error if copying fails.
   */
  const handleCopyUrl = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy URL:', err);
        setError('Failed to copy URL to clipboard');
      });
  };

  /**
   * Copies the generated animation code (React component or CSS) to the clipboard.
   * @param animationConfig - The current animation configuration object.
   */
  const handleCopyCode = (animationConfig: AnimationConfig) => {
    let code: string;

    switch (exportTab) {
      case 'react':
        code = generateReactComponent(animationConfig);
        break;
      case 'css':
        code = generateCSSCode(animationConfig);
        break;
      default:
        setError('Unknown export type');
        return;
    }

    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy code:', err);
        setError('Failed to copy code to clipboard');
      });
  };

  return {
    shareDialogOpen,
    setShareDialogOpen,
    exportDialogOpen,
    setExportDialogOpen,
    shareUrl,
    copySuccess,
    exportTab,
    setExportTab,
    error,
    setError,
    handleShare,
    handleExport,
    handleCopyUrl,
    handleCopyCode,
  };
}
