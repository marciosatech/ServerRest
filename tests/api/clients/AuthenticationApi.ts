import type { APIRequestContext, APIResponse } from '@playwright/test';

export class AuthenticationApi {
  readonly requisicao: APIRequestContext;
  readonly enderecoBase: string;

  constructor(requisicao: APIRequestContext) {
    this.requisicao = requisicao;
    this.enderecoBase = process.env.API_BASE_URL ?? 'https://serverest.dev';
  }

  async enviarLogin(email: string, senha: string): Promise<APIResponse> {
    return this.requisicao.post(`${this.enderecoBase}/login`, {
      data: { email, password: senha },
    });
  }
}
