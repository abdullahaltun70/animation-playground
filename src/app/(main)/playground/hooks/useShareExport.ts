import { useState, useCallback } from 'react';

import {
  generateCSSCode,
  generateReactComponent,
} from '@/app/utils/animations';
import { AnimationConfig } from '@/types/animations';

/**
 * @hook useShareExport
 * @description Manages the state and logic for sharing and exporting animation configurations.
 * It handles dialog visibility, URL generation for sharing, and code generation for export.
 * @param {string | null} configId - The ID of the current animation configuration, or null if new.
 * @returns {object} An object containing:
 *  - `shareDialogOpen`: Boolean, true if the share dialog is open, false otherwise.
 *  - `setShareDialogOpen`: Function to set the visibility of the share dialog.
 *  - `exportDialogOpen`: Boolean, true if the export dialog is open, false otherwise.
 *  - `setExportDialogOpen`: Function to set the visibility of the export dialog.
 *  - `shareUrl`: String, the generated URL for sharing the configuration.
 *  - `copySuccess`: Boolean, true if a copy operation (URL or code) was successful, false otherwise.
 *  - `exportTab`: String, the currently selected tab in the export dialog (e.g., 'react', 'css').
 *  - `setExportTab`: Function to set the active export tab.
 *  - `error`: String or null, holds an error message if an operation fails.
 *  - `setError`: Function to set or clear the error state.
 *  - `handleShare`: Function to initiate the sharing process.
 *  - `handleExport`: Function to open the export dialog.
 *  - `handleCopyUrl`: Function to copy the shareable URL to the clipboard.
 *  - `handleCopyCode`: Function to copy the generated animation code to the clipboard.
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
  const handleShare = useCallback(() => {
    if (!configId) {
      setError('Please save your configuration before sharing');
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('id', configId);
    setShareUrl(url.toString());
    setShareDialogOpen(true);
  }, [configId, setError, setShareUrl, setShareDialogOpen]);

  /**
   * Opens the export dialog.
   */
  const handleExport = useCallback(() => {
    setExportDialogOpen(true);
  }, [setExportDialogOpen]);

  /**
   * Copies the generated share URL to the clipboard.
   * Shows a success message or an error if copying fails.
   */
  const handleCopyUrl = useCallback(() => {
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
  }, [shareUrl, setCopySuccess, setError]);

  /**
   * Copies the generated animation code (React component or CSS) to the clipboard.
   * @param animationConfig - The current animation configuration object.
   */
  const handleCopyCode = useCallback(
    (animationConfig: AnimationConfig) => {
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
    },
    [exportTab, setCopySuccess, setError]
  );

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
