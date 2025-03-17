import { test, expect } from '@playwright/test';
import {CartPage} from './fixtures/cart.page';

import slugs from './config/slugs.json';
import UIReference from './config/element-identifiers/element-identifiers.json';

test.use({ storageState: './auth-storage/AuthWithProduct.json' });

test('Product should already be in cart', async ({page}) => {
  await page.goto(slugs.cartSlug);
  await expect(page.getByRole('strong').getByRole('link', { name: UIReference.productPage.simpleProductTitle }),`${UIReference.productPage.simpleProductTitle} should be in cart`).toBeVisible();
});

test('Change quantity of product in cart', async ({page}) => {
  await page.goto(slugs.cartSlug);
  const cart = new CartPage(page);
  await cart.changeProductQuantity('2');
});

test('Using older storage state means only one product should be in the cart', async ({page, browser}) => {
  await browser.newContext({ storageState: './auth-storage/AuthWithProduct.json' });
  await page.goto(slugs.cartSlug);
  await expect(page.getByRole('strong').getByRole('link', { name: UIReference.productPage.simpleProductTitle }),`${UIReference.productPage.simpleProductTitle} should be in cart`).toBeVisible();
});