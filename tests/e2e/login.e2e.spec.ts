import { test } from './fixtures/login.fixture';
import { capturarEvidencia } from '../support/capture-evidence';

test.describe('E2E | Login', () => {
  test('deve exibir erros de obrigatoriedade ao enviar o formulário vazio', async ({ page, loginPage }) => {
    await loginPage.abrir();
    await loginPage.enviarFormulario();

    await loginPage.validarErrosDeCamposObrigatorios();
    await capturarEvidencia(page, test.info(), 'login-formulario-vazio');
  });

  test('deve exibir erro ao enviar credenciais inválidas', async ({ page, dadosLogin, loginPage }) => {
    await loginPage.abrir();
    await loginPage.entrarComCredenciais(
      dadosLogin.credenciaisInvalidas.email,
      dadosLogin.credenciaisInvalidas.password,
    );

    await loginPage.validarErroDeCredenciaisInvalidas();
    await capturarEvidencia(page, test.info(), 'login-credenciais-invalidas');
  });

  test('deve autenticar com credenciais válidas', async ({ page, homePage, dadosLogin, loginPage }) => {
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
