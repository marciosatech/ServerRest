import * as allure from 'allure-js-commons';
import { test } from './fixtures/login.fixture';
import { capturarEvidencia } from '../support/capture-evidence';

test.describe('E2E | Login', () => {
  test.beforeEach(async () => {
    await allure.epic('Autenticação');
    await allure.feature('Login');
    await allure.parentSuite('E2E');
    await allure.suite('Login');
    await allure.layer('E2E');
    await allure.tags('e2e', 'login');
  });

  test('deve exibir erros de obrigatoriedade ao enviar o formulário vazio', async ({ page, loginPage }) => {
    await allure.story('Campos obrigatórios');
    await allure.severity(allure.Severity.NORMAL);

    await loginPage.abrir();
    await loginPage.enviarFormulario();

    await loginPage.validarErrosDeCamposObrigatorios();
    await capturarEvidencia(page, test.info(), 'login-formulario-vazio');
  });

  test('deve exibir erro ao enviar credenciais inválidas', async ({ page, dadosLogin, loginPage }) => {
    await allure.story('Credenciais inválidas');
    await allure.severity(allure.Severity.CRITICAL);

    await loginPage.abrir();
    await loginPage.entrarComCredenciais(
      dadosLogin.credenciaisInvalidas.email,
      dadosLogin.credenciaisInvalidas.password,
    );

    await loginPage.validarErroDeCredenciaisInvalidas();
    await capturarEvidencia(page, test.info(), 'login-credenciais-invalidas');
  });

  test('deve autenticar com credenciais válidas', async ({ page, homePage, dadosLogin, loginPage }) => {
    await allure.story('Credenciais válidas');
    await allure.severity(allure.Severity.BLOCKER);

    test.skip(
      !dadosLogin.credenciaisValidas.email || !dadosLogin.credenciaisValidas.password,
      'Defina LOGIN_EMAIL e LOGIN_PASSWORD para executar o login válido.',
    );

    await loginPage.abrir();
    await loginPage.entrarComCredenciais(
      dadosLogin.credenciaisValidas.email,
      dadosLogin.credenciaisValidas.password,
    );

    await homePage.validarPaginaExibida();
    await capturarEvidencia(page, test.info(), 'login-credenciais-validas');
  });
});
