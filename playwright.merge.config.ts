import { defineConfig } from '@playwright/test';

// Usado pelo job de relatorios para unificar os blobs de cada camada (npx playwright merge-reports).
export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/result.json' }],
  ],
});
