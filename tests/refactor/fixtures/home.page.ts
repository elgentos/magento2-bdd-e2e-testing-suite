import {expect, type Locator, type Page} from '@playwright/test';


export class HomePage {
  readonly page: Page;
  readonly buyProductButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buyProductButton = this.page.getByRole('button').filter({hasText: 'Add to Cart'}).first();
  }

  async addHomepageProductToCart(){
    await this.buyProductButton.click();
  }
}