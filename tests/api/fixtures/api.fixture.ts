import { test as base } from '@playwright/test';
import { AuthenticationApi } from '../clients/AuthenticationApi';

export type FixturesApi = {
  authenticationApi: AuthenticationApi;
};

export const test = base.extend<FixturesApi>({
  authenticationApi: async ({ request }, use) => {
    await use(new AuthenticationApi(request));
  },
});
