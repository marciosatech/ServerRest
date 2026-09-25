import { expect } from '@playwright/test';
import dadosLogin from '../data/login.data.json';
import { test } from './fixtures/api.fixture';

test.describe('API de login', () => {
  test('deve rejeitar login sem e-mail e senha', async ({ authenticationApi }) => {
    const resposta = await authenticationApi.enviarLogin('', '');
    const corpo = await resposta.json();

    expect(resposta.status()).toBe(400);
    expect(corpo).toEqual({
      email: 'email não pode ficar em branco',
      password: 'password não pode ficar em branco',
    });
  });

  test('deve rejeitar credenciais inválidas', async ({ authenticationApi }) => {
    const resposta = await authenticationApi.enviarLogin(
      dadosLogin.credenciaisInvalidas.email,
      dadosLogin.credenciaisInvalidas.password,
    );
    const corpo = await resposta.json();

    expect(resposta.status()).toBe(401);
    expect(corpo).toEqual({
      message: 'Email e/ou senha inválidos',
    });
  });

  test('deve autenticar com credenciais válidas', async ({ authenticationApi }) => {
    const email = process.env.LOGIN_EMAIL ?? '';
    const senha = process.env.LOGIN_PASSWORD ?? '';

    test.skip(
      !email || !senha,
      'Defina LOGIN_EMAIL e LOGIN_PASSWORD para executar o login válido.',
    );

    const resposta = await authenticationApi.enviarLogin(email, senha);
    const corpo = await resposta.json();

    expect(resposta.status()).toBe(200);
    expect(corpo.message).toBe('Login realizado com sucesso');
    expect(corpo.authorization).toBeTruthy();
  });
});
