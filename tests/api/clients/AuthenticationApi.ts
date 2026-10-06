import { test, type APIRequestContext, type APIResponse } from '@playwright/test';

export class AuthenticationApi {
  readonly requisicao: APIRequestContext;
  readonly enderecoBase: string;

  constructor(requisicao: APIRequestContext) {
    this.requisicao = requisicao;
    this.enderecoBase = process.env.API_BASE_URL ?? 'https://serverest.dev';
  }

  async enviarLogin(email: string, senha: string): Promise<APIResponse> {
    return test.step('POST /login', async () => {
      const url = `${this.enderecoBase}/login`;
      const resposta = await this.requisicao.post(url, {
        data: { email, password: senha },
      });

      // Credenciais vindas de secrets sao mascaradas porque o relatorio Allure e publicado no GitHub Pages.
      const emailExibido = email && email === process.env.LOGIN_EMAIL ? '***' : email;
      await test.info().attach('Requisição', {
        body: JSON.stringify({ metodo: 'POST', url, corpo: { email: emailExibido, password: senha ? '***' : '' } }, null, 2),
        contentType: 'application/json',
      });
      await test.info().attach(`Resposta ${resposta.status()}`, {
        body: await resposta.text(),
        contentType: 'application/json',
      });

      return resposta;
    });
  }
}
