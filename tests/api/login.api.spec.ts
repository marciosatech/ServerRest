import { expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import dadosLogin from '../data/login.data.json';
import { test } from './fixtures/api.fixture';

test.describe('API de login', () => {
  test.beforeEach(async () => {
    await allure.epic('Autenticação');
    await allure.feature('Login');
    await allure.parentSuite('API');
    await allure.suite('Login');
    await allure.layer('API');
    await allure.tags('api', 'login');
  });

  test('deve rejeitar login sem e-mail e senha', async ({ authenticationApi }) => {
    await allure.story('Campos obrigatórios');
    await allure.severity(allure.Severity.NORMAL);

    const resposta = await authenticationApi.enviarLogin('', '');
    const corpo = await resposta.json();

    expect(resposta.status()).toBe(400);
    expect(corpo).toEqual({
      email: 'email não pode ficar em branco',
      password: 'password não pode ficar em branco',
    });
  });

  test('deve rejeitar credenciais inválidas', async ({ authenticationApi }) => {
    await allure.story('Credenciais inválidas');
    await allure.severity(allure.Severity.CRITICAL);

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
    await allure.story('Credenciais válidas');
    await allure.severity(allure.Severity.BLOCKER);

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
