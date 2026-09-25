import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly campoEmail: Locator;
  readonly campoSenha: Locator;
  readonly botaoEntrar: Locator;
  readonly erroEmailObrigatorio: Locator;
  readonly erroSenhaObrigatoria: Locator;
  readonly erroCredenciaisInvalidas: Locator;

  constructor(page: Page) {
    this.page = page;
    this.campoEmail = page.getByPlaceholder('Digite seu email');
    this.campoSenha = page.getByPlaceholder('Digite sua senha');
    this.botaoEntrar = page.getByRole('button', { name: 'Entrar' });
    this.erroEmailObrigatorio = page.getByText('Email é obrigatório');
    this.erroSenhaObrigatoria = page.getByText('Password é obrigatório');
    this.erroCredenciaisInvalidas = page.getByText('Email e/ou senha inválidos');
  }

  async abrir(): Promise<void> {
    await this.page.goto('/login');
  }

  async enviarFormulario(): Promise<void> {
    await this.botaoEntrar.click();
  }

  async entrarComCredenciais(email: string, senha: string): Promise<void> {
    await this.campoEmail.fill(email);
    await this.campoSenha.fill(senha);
    await this.enviarFormulario();
  }

  async validarErrosDeCamposObrigatorios(): Promise<void> {
    await expect(this.erroEmailObrigatorio).toBeVisible();
    await expect(this.erroSenhaObrigatoria).toBeVisible();
    await this.validarPermanenciaNaPaginaDeLogin();
  }

  async validarErroDeCredenciaisInvalidas(): Promise<void> {
    await expect(this.erroCredenciaisInvalidas).toBeVisible();
    await this.validarPermanenciaNaPaginaDeLogin();
  }

  private async validarPermanenciaNaPaginaDeLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login$/);
  }
}
