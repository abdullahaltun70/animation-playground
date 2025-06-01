/**
 * Automated Accessibility Audit Script
 * Runs comprehensive accessibility tests using multiple tools
 */
import { injectAxe } from 'axe-playwright';
import { chromium, Browser, Page } from 'playwright';

interface AccessibilityResult {
  url: string;
  violations: unknown[];
  passes: unknown[];
  incomplete: unknown[];
  inapplicable: unknown[];
  timestamp: string;
}

interface AuditReport {
  summary: {
    totalPages: number;
    totalViolations: number;
    totalPasses: number;
    wcagLevel: string;
    testDate: string;
  };
  results: AccessibilityResult[];
  recommendations: string[];
}

class AccessibilityAuditor {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    });
    this.page = await this.browser.newPage();

    // Set viewport to standard desktop size
    await this.page.setViewportSize({ width: 1200, height: 800 });

    // Inject axe-core
    await injectAxe(this.page);
  }

  async auditPage(
    url: string,
    options: {
      reducedMotion?: boolean;
      highContrast?: boolean;
      screenReader?: boolean;
    } = {}
  ): Promise<AccessibilityResult> {
    if (!this.page) throw new Error('Auditor not initialized');

    // Set media preferences
    if (options.reducedMotion) {
      await this.page.emulateMedia({ reducedMotion: 'reduce' });
    }

    if (options.highContrast) {
      await this.page.emulateMedia({ forcedColors: 'active' });
    }

    // Navigate to page
    await this.page.goto(url, { waitUntil: 'networkidle' });

    // Wait for animations to complete
    await this.page.waitForTimeout(3000);

    // Run axe accessibility checks
    const axeResults = await this.page.evaluate(() => {
      interface Axe {
        run: (options: object) => Promise<{
          violations: unknown[];
          passes: unknown[];
          incomplete: unknown[];
          inapplicable: unknown[];
        }>;
      }
      // Extend the window type to include axe
      const win = window as Window & { axe: Axe };
      return win.axe.run({
        rules: {
          // WCAG 2.1 AA rules
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-management': { enabled: true },
          'aria-roles': { enabled: true },
          'aria-properties': { enabled: true },
          'semantic-markup': { enabled: true },
          'form-labels': { enabled: true },
          'heading-order': { enabled: true },
          'landmark-roles': { enabled: true },
          'link-purpose': { enabled: true },
          'skip-link': { enabled: true },
          'table-headers': { enabled: true },
          'page-title': { enabled: true },
          language: { enabled: true },
          'resize-text': { enabled: true },
          motion: { enabled: true },
        },
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      });
    });

    return {
      url,
      violations: axeResults.violations,
      passes: axeResults.passes,
      incomplete: axeResults.incomplete,
      inapplicable: axeResults.inapplicable,
      timestamp: new Date().toISOString(),
    };
  }

  async testKeyboardNavigation(url: string): Promise<boolean> {
    if (!this.page) throw new Error('Auditor not initialized');

    await this.page.goto(url, { waitUntil: 'networkidle' });

    // Test skip link
    await this.page.keyboard.press('Tab');
    const skipLink = await this.page.locator('a[href="#main-content"]').first();
    if (await skipLink.isVisible()) {
      await this.page.keyboard.press('Enter');

      // Check if main content receives focus
      const mainContent = await this.page
        .locator('#main-content, [role="main"]')
        .first();
      const isFocused = await mainContent.evaluate(
        (el) =>
          document.activeElement === el || el.contains(document.activeElement)
      );

      if (!isFocused) return false;
    }

    // Test form navigation
    const formInputs = await this.page
      .locator('input, textarea, button, select, [tabindex="0"]')
      .all();
    let tabbableCount = 0;

    for (let i = 0; i < Math.min(10, formInputs.length); i++) {
      await this.page.keyboard.press('Tab');
      const focusedElement = await this.page.evaluate(
        () => document.activeElement?.tagName
      );
      if (
        focusedElement &&
        ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'A'].includes(focusedElement)
      ) {
        tabbableCount++;
      }
    }

    return tabbableCount > 0;
  }

  async testScreenReaderCompatibility(url: string): Promise<{
    hasSemanticMarkup: boolean;
    hasProperHeadings: boolean;
    hasAriaLabels: boolean;
    hasLandmarks: boolean;
  }> {
    if (!this.page) throw new Error('Auditor not initialized');

    await this.page.goto(url, { waitUntil: 'networkidle' });

    const results = await this.page.evaluate(() => {
      // Check semantic markup
      const semanticElements = document.querySelectorAll(
        'main, nav, header, footer, article, section, aside'
      );
      const hasSemanticMarkup = semanticElements.length > 0;

      // Check heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const hasProperHeadings =
        headings.length > 0 && document.querySelector('h1') !== null;

      // Check ARIA labels
      const ariaElements = document.querySelectorAll(
        '[aria-label], [aria-labelledby], [aria-describedby]'
      );
      const hasAriaLabels = ariaElements.length > 0;

      // Check landmarks
      const landmarks = document.querySelectorAll(
        '[role="main"], [role="banner"], [role="contentinfo"], [role="navigation"]'
      );
      const hasLandmarks = landmarks.length > 0;

      return {
        hasSemanticMarkup,
        hasProperHeadings,
        hasAriaLabels,
        hasLandmarks,
      };
    });

    return results;
  }

  async testMotionPreferences(url: string): Promise<{
    respectsReducedMotion: boolean;
    animationsDisabled: boolean;
  }> {
    if (!this.page) throw new Error('Auditor not initialized');

    // Test with reduced motion preference
    await this.page.emulateMedia({ reducedMotion: 'reduce' });
    await this.page.goto(url, { waitUntil: 'networkidle' });

    const results = await this.page.evaluate(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      // Check if animations are actually disabled
      const animatedElements = document.querySelectorAll(
        '[style*="animation"], [style*="transition"]'
      );
      let animationsDisabled = true;

      animatedElements.forEach((element) => {
        const style = window.getComputedStyle(element);
        if (
          style.animationDuration !== '0s' &&
          style.animationDuration !== ''
        ) {
          animationsDisabled = false;
        }
        if (
          style.transitionDuration !== '0s' &&
          style.transitionDuration !== ''
        ) {
          animationsDisabled = false;
        }
      });

      return {
        respectsReducedMotion: prefersReducedMotion,
        animationsDisabled: prefersReducedMotion ? animationsDisabled : true,
      };
    });

    return results;
  }

  async generateReport(urls: string[]): Promise<AuditReport> {
    const results: AccessibilityResult[] = [];
    let totalViolations = 0;
    let totalPasses = 0;

    for (const url of urls) {
      // Test with normal settings
      const normalResult = await this.auditPage(url);
      results.push(normalResult);
      totalViolations += normalResult.violations.length;
      totalPasses += normalResult.passes.length;

      // Test with reduced motion
      const reducedMotionResult = await this.auditPage(url, {
        reducedMotion: true,
      });
      results.push({
        ...reducedMotionResult,
        url: `${url} (Reduced Motion)`,
      });
      totalViolations += reducedMotionResult.violations.length;
      totalPasses += reducedMotionResult.passes.length;

      // Test keyboard navigation
      const keyboardWorking = await this.testKeyboardNavigation(url);
      console.log(
        `Keyboard navigation for ${url}: ${keyboardWorking ? 'PASS' : 'FAIL'}`
      );

      // Test screen reader compatibility
      const screenReaderResults = await this.testScreenReaderCompatibility(url);
      console.log(
        `Screen reader compatibility for ${url}:`,
        screenReaderResults
      );

      // Test motion preferences
      const motionResults = await this.testMotionPreferences(url);
      console.log(`Motion preferences for ${url}:`, motionResults);
    }

    // Generate recommendations
    const recommendations: string[] = [];
    const violationTypes = new Set<string>();

    results.forEach((result) => {
      result.violations.forEach((violation) => {
        if (violation && typeof violation === 'object' && 'id' in violation) {
          violationTypes.add((violation as { id: string }).id);
        }
      });
    });

    if (violationTypes.has('color-contrast')) {
      recommendations.push(
        'Improve color contrast ratios to meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)'
      );
    }
    if (violationTypes.has('keyboard')) {
      recommendations.push(
        'Ensure all interactive elements are keyboard accessible'
      );
    }
    if (violationTypes.has('aria')) {
      recommendations.push(
        'Add proper ARIA labels and descriptions for complex UI components'
      );
    }
    if (violationTypes.has('heading-order')) {
      recommendations.push(
        'Maintain logical heading hierarchy (h1 → h2 → h3, etc.)'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Excellent! No accessibility violations found. Continue following WCAG 2.1 AA guidelines.'
      );
    }

    return {
      summary: {
        totalPages: urls.length,
        totalViolations,
        totalPasses,
        wcagLevel: totalViolations === 0 ? 'WCAG 2.1 AAA' : 'WCAG 2.1 AA',
        testDate: new Date().toISOString(),
      },
      results,
      recommendations,
    };
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Export for use in tests
export { AccessibilityAuditor, type AuditReport, type AccessibilityResult };

// Command line usage
if (require.main === module) {
  async function runAudit() {
    const auditor = new AccessibilityAuditor();

    try {
      await auditor.initialize();

      const urls = [
        'http://localhost:3000/bla', // Accessibility demo page
        'http://localhost:3000/documentation', // Documentation page
        'http://localhost:3000/', // Main page
      ];

      console.log('Starting accessibility audit...');
      const report = await auditor.generateReport(urls);

      console.log('\n=== ACCESSIBILITY AUDIT REPORT ===');
      console.log(`Test Date: ${report.summary.testDate}`);
      console.log(`Total Pages Tested: ${report.summary.totalPages}`);
      console.log(`Total Violations: ${report.summary.totalViolations}`);
      console.log(`Total Passes: ${report.summary.totalPasses}`);
      console.log(`WCAG Compliance Level: ${report.summary.wcagLevel}`);

      if (report.summary.totalViolations > 0) {
        console.log('\n=== VIOLATIONS FOUND ===');
        report.results.forEach((result) => {
          if (result.violations.length > 0) {
            console.log(`\nPage: ${result.url}`);
            result.violations.forEach((violation) => {
              const v = violation as {
                id: string;
                description: string;
                nodes: Array<{ target: string[] }>;
              };
              console.log(`  - ${v.id}: ${v.description}`);
              v.nodes.forEach((node) => {
                console.log(`    Target: ${node.target.join(', ')}`);
              });
            });
          }
        });
      }

      console.log('\n=== RECOMMENDATIONS ===');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });

      // Save report to file
      const fs = require('fs');
      const reportPath = './accessibility-audit-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\nDetailed report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      await auditor.cleanup();
    }
  }

  runAudit();
}
