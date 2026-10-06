import os from 'node:os';
import { defineConfig, devices } from '@playwright/test';

const baseURL = 'https://front.serverest.dev';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    // No CI cada camada roda em um job; os blobs sao unificados depois em playwright.merge.config.ts.
    ...(process.env.CI
      ? ([
          ['github'],
          ['blob', { fileName: `relatorio-${process.env.CAMADA_TESTE ?? 'todos'}.zip` }],
        ] as const)
      : ([
          ['html', { open: 'never' }],
          ['json', { outputFile: 'test-results/result.json' }],
        ] as const)),
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: false,
        suiteTitle: false,
        environmentInfo: {
          Ambiente: process.env.CI ? 'GitHub Actions' : 'Local',
          'URL do front': baseURL,
          'URL da API': process.env.API_BASE_URL ?? 'https://serverest.dev',
          Navegador: 'Chromium (Desktop Chrome)',
          'Sistema operacional': `${os.type()} ${os.release()}`,
          'Node.js': process.version,
          Branch: process.env.GITHUB_REF_NAME ?? 'local',
          Commit: process.env.GITHUB_SHA?.slice(0, 7) ?? 'local',
        },
        categories: [
          {
            name: 'Falhas de asserção',
            messageRegex: '.*expect.*|.*Expected.*',
            matchedStatuses: ['failed'],
          },
          {
            name: 'Timeouts',
            messageRegex: '.*[Tt]imeout.*',
            matchedStatuses: ['failed', 'broken'],
          },
          {
            name: 'Erros de infraestrutura / rede',
            messageRegex: '.*(ECONNREFUSED|ENOTFOUND|ETIMEDOUT|net::ERR_).*',
            matchedStatuses: ['broken', 'failed'],
          },
          {
            name: 'Testes instáveis',
            matchedStatuses: ['passed', 'failed', 'broken'],
            flaky: true,
          },
          {
            name: 'Testes ignorados',
            matchedStatuses: ['skipped'],
          },
        ],
      },
    ],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
});
