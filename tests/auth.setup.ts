import { chromium, Browser, Page, expect } from '@playwright/test';
import slugs from './base/config/slugs.json';
import UIReference from './base/config/element-identifiers/element-identifiers.json';

async function globalSetup(email: string, password: string){
  const browser: Browser = await chromium.launch({headless: false});
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  let loginEmailField = page.getByLabel(UIReference.credentials.emailFieldLabel, {exact: true});
  let loginPasswordField = page.getByLabel(UIReference.credentials.passwordFieldLabel, {exact: true});
  let loginButton = page.getByRole('button', { name: UIReference.credentials.loginButtonLabel });

  await page.goto('https://hyva-demo.elgentos.io/customer/account/login');
  await loginEmailField.fill("user-AUTH@elgentos.nl");
  await loginPasswordField.fill("Test1234!");
  await loginButton.press("Enter");

  await expect(page.getByRole('link', { name: UIReference.mainMenu.myAccountLogoutItem })).toBeVisible();

  // Save the logged in state of the webpage
  await page.context().storageState({ path: './auth-storage/LoginAuth.json' });
  await browser.close();
}

export default globalSetup;