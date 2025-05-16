import { useState } from 'react';

import {
  generateCSSCode,
  generateReactComponent,
} from '@/app/utils/animations';
import { AnimationConfig } from '@/types/animations';

export function useShareExport(configId: string | null) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportTab, setExportTab] = useState('react');
  const [error, setError] = useState<string | null>(null);

  const handleShare = () => {
    if (!configId) {
      setError('Please save your configuration before sharing');
      return;
    }

    // Generate shareable URL
    const url = new URL(window.location.href);
    url.searchParams.set('id', configId);
    setShareUrl(url.toString());
    setShareDialogOpen(true);
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

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
