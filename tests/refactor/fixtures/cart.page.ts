import {expect, type Locator, type Page} from '@playwright/test';
import selectors from '../config/selectors/selectors.json';

export class CartPage {
  readonly page: Page;
  readonly applyDiscountButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.applyDiscountButton = this.page.getByRole('button', { name: 'Apply Discount Code' });
  }

  async removeProduct(name: string){
    console.log(name);
    let removeButton = this.page.getByLabel(`Remove ${name}`);
    await removeButton.click();

    await expect(removeButton,`Button to remove product is no longer visible`).toBeHidden();
  }
}