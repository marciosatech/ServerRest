import type { Page, TestInfo } from '@playwright/test';

export async function capturarEvidencia(
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<void> {
  const caminho = testInfo.outputPath(`${name}.png`);

  await page.screenshot({ path: caminho, fullPage: true });
  // Anexar faz a evidencia aparecer nos relatorios HTML e Allure, nao apenas na pasta de saida.
  await testInfo.attach(name, { path: caminho, contentType: 'image/png' });
}
