import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly tituloProdutos: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tituloProdutos = page.getByText('Produtos');
  }

  async validarPaginaExibida(): Promise<void> {
    await expect(this.page).toHaveURL(/\/home$/);
    await expect(this.tituloProdutos).toBeVisible();
  }
}
