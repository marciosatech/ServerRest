import { test as base } from '@playwright/test';
import dadosLogin from '../../data/login.data.json';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

export type CredenciaisLogin = {
  email: string;
  password: string;
};

export type DadosLogin = {
  credenciaisInvalidas: CredenciaisLogin;
  credenciaisValidas: CredenciaisLogin;
};

export type FixturesLogin = {
  dadosLogin: DadosLogin;
  homePage: HomePage;
  loginPage: LoginPage;
};

export const test = base.extend<FixturesLogin>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dadosLogin: async ({}, use) => {
    await use({
      credenciaisInvalidas: dadosLogin.credenciaisInvalidas,
      credenciaisValidas: {
        email: process.env.LOGIN_EMAIL ?? '',
        password: process.env.LOGIN_PASSWORD ?? '',
      },
    });
  },
});
