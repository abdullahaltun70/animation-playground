'use client';

import { Box, Flex } from '@radix-ui/themes';

import styles from './styles/loading.module.scss';

export default function Loading() {
  return (
    <Flex className={styles.container}>
      {/* LEFT : animation preview */}
      <Box className={styles.previewArea}>
        <Box className={`${styles.skeleton} ${styles.preview}`} />

        {/* action buttons (share / export) */}
        <Flex gap="2" className={styles.actionButtons}>
          <Box className={`${styles.skeleton} ${styles.actionBtn}`} />
          <Box className={`${styles.skeleton} ${styles.actionBtn}`} />
        </Flex>
      </Box>

      {/* RIGHT : config‑panel */}
      <Box className={styles.panelWrapper}>
        <Box className={`${styles.skeleton} ${styles.panelHeader}`} />

        {/* input skeletons */}
        <Box className={`${styles.skeleton} ${styles.input}`} />
        <Box className={`${styles.skeleton} ${styles.input}`} />

        {/* select boxes */}
        <Box className={`${styles.skeleton} ${styles.select}`} />
        <Box className={`${styles.skeleton} ${styles.select}`} />

        {/* slider / range rows */}
        <Box className={`${styles.skeleton} ${styles.slider}`} />
        <Box className={`${styles.skeleton} ${styles.slider}`} />

        {/* final buttons */}
        <Flex gap="2" mt="auto">
          <Box className={`${styles.skeleton} ${styles.btn}`} />
          <Box className={`${styles.skeleton} ${styles.btnPrimary}`} />
        </Flex>
      </Box>
    </Flex>
  );
}
