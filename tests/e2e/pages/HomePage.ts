import { expect, test, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly tituloProdutos: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tituloProdutos = page.getByText('Produtos');
  }

  async validarPaginaExibida(): Promise<void> {
    await test.step('Validar que a página inicial foi exibida', async () => {
      await expect(this.page).toHaveURL(/\/home$/);
      await expect(this.tituloProdutos).toBeVisible();
    });
  }
}
