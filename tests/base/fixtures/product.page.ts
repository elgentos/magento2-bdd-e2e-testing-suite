import {expect, type Locator, type Page} from '@playwright/test';
import slugs from '../config/slugs.json';
import UIReference from '../config/element-identifiers/element-identifiers.json';
import outcomeMarker from '../config/outcome-markers/outcome-markers.json';

export class ProductPage {
  readonly page: Page;
  simpleProductTitle: Locator;
  simpleProductAddToCartButon: Locator;
  addToCompareButton: Locator;
  addToWishlistButton: Locator;
  relatedProductsSection: Locator;
  relatedProductAddToCartButton: Locator;
  relatedProductAddToWishlistButton: Locator;
  relatedProductAddToCompareButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.simpleProductAddToCartButon = page.getByRole('button', { name: 'shopping-cart Add to Cart' });
    this.addToCompareButton = page.getByLabel('Add to Compare', { exact: true });
    this.addToWishlistButton = page.getByLabel('Add to Wish List', { exact: true });

    // Add related products locators
    this.relatedProductsSection = page.getByText('We found other products you might like! Navigating through the elements of the');
    this.relatedProductAddToCartButton = this.relatedProductsSection.getByRole('button', { name: /Add to Cart/i });
    // Update these locators to use partial matching instead of exact matching
    this.relatedProductAddToWishlistButton = this.relatedProductsSection.getByLabel(/Add to Wish List/i, { exact: false });
    this.relatedProductAddToCompareButton = this.relatedProductsSection.getByLabel(/Add to Compare/i, { exact: false });
  }

  // ==============================================
  // Productpage-related methods
  // ==============================================

  async addProductToCompare(product:string, url: string){
    let productAddedNotification = `${outcomeMarker.productPage.simpleProductAddedNotification} product`;
    await this.page.goto(url);
    await this.addToCompareButton.click();
    await expect(this.page.getByText(productAddedNotification)).toBeVisible();

    await this.page.goto(slugs.productpage.productComparisonSlug);

    // Assertion: a cell with the product name inside a cell with the product name should be visible
    await expect(this.page.getByRole('cell', {name: product}).getByText(product, {exact: true})).toBeVisible();
  }

  async addProductToWishlist(product:string, url: string){
    let addedToWishlistNotification = `${product} ${outcomeMarker.wishListPage.wishListAddedNotification}`;
    await this.page.goto(url);
    await this.addToWishlistButton.click();

    await this.page.waitForLoadState();

    let productNameInWishlist = this.page.locator(UIReference.wishListPage.wishListItemGridLabel).getByText(UIReference.productPage.simpleProductTitle, {exact: true});

    await expect(this.page).toHaveURL(new RegExp(slugs.wishListRegex));
    await expect(this.page.getByText(addedToWishlistNotification)).toBeVisible();
    await expect(productNameInWishlist).toContainText(product);
  }

  async leaveProductReview(product:string, url: string){
    await this.page.goto(url);

    //TODO: Uncomment this and fix test once website is fixed
    /*
      await page.locator('#Rating_5_label path').click();
      await page.getByPlaceholder('Nickname*').click();
      await page.getByPlaceholder('Nickname*').fill('John');
      await page.getByPlaceholder('Nickname*').press('Tab');
      await page.getByPlaceholder('Summary*').click();
      await page.getByPlaceholder('Summary*').fill('A short paragraph');
      await page.getByPlaceholder('Review*').click();
      await page.getByPlaceholder('Review*').fill('Review message!');
      await page.getByRole('button', { name: 'Submit Review' }).click();
      await page.getByRole('img', { name: 'loader' }).click();
    */
  }

  async openLightboxAndScrollThrough(url: string){
    await this.page.goto(url);
    let fullScreenOpener = this.page.getByLabel(UIReference.productPage.fullScreenOpenLabel);
    let fullScreenCloser = this.page.getByLabel(UIReference.productPage.fullScreenCloseLabel);
    let thumbnails = this.page.getByRole('button', {name: UIReference.productPage.thumbnailImageLabel});

    await fullScreenOpener.click();
    await expect(fullScreenCloser).toBeVisible();

    for (const img of await thumbnails.all()) {
      await img.click();
      // wait for transition animation
      await this.page.waitForTimeout(500);
      await expect(img, `CSS class 'border-primary' appended to button`).toHaveClass(new RegExp(outcomeMarker.productPage.borderClassRegex));
    }

    await fullScreenCloser.click();
    await expect(fullScreenCloser).toBeHidden();

  }

  // ==============================================
  // Cart-related methods
  // ==============================================

  async addSimpleProductToCart(product: string, url: string, quantity?: string) {
    await this.page.goto(url);
    this.simpleProductTitle = this.page.getByRole('heading', {name: product, exact:true});
    let productAddedNotification = `${outcomeMarker.productPage.simpleProductAddedNotification} ${product}`;

    this.simpleProductTitle = this.page.getByRole('heading', {name: product, exact:true});
    expect(await this.simpleProductTitle.innerText()).toEqual(product);
    await expect(this.simpleProductTitle.locator('span')).toBeVisible();

    if(quantity){
      // set quantity
      await this.page.getByLabel(UIReference.productPage.quantityFieldLabel).fill('2');
    }

    await this.simpleProductAddToCartButon.click();
    await expect(this.page.getByText(productAddedNotification)).toBeVisible();
  }

  async addConfigurableProductToCart(){
    const productOptions = this.page.locator(UIReference.productPage.configurableProductOptionForm);

    // loop through each radiogroup (product option) within the form
    for (const option of await productOptions.getByRole('radiogroup').all()) {
        await option.locator(UIReference.productPage.configurableProductOptionValue).first().check();
    }

    await this.simpleProductAddToCartButon.click();
    await this.page.waitForLoadState();
  }

  async testRelatedProductButtons(url: string) {
    await this.page.goto(url);

    // Check if related products section exists
    await expect(this.relatedProductsSection).toBeVisible();

    // Test Add to Cart button - get the actual product name dynamically
    // Find the first related product's name by looking at the link text
    const firstRelatedProductLink = this.relatedProductsSection.locator('a.product-item-link').first();
    const firstRelatedProductTitle = await firstRelatedProductLink.innerText();

    await this.relatedProductAddToCartButton.first().click();
    await expect(this.page.getByText(`${outcomeMarker.productPage.simpleProductAddedNotification} ${firstRelatedProductTitle}`)).toBeVisible();

    // Test Add to Wishlist button (requires login)
    await this.page.goto(url);
    await this.relatedProductAddToWishlistButton.first().click();

    // Use a more flexible approach to detect the wishlist confirmation
    // Either wait for a notification containing the product name and "Wish List"
    // or wait for the page to navigate to the wishlist page
    await Promise.any([
      expect(this.page.getByText(new RegExp(`${firstRelatedProductTitle}.*Wish List`, 'i'))).toBeVisible({ timeout: 10000 }),
      expect(this.page).toHaveURL(new RegExp(slugs.wishListRegex), { timeout: 10000 })
    ]);

    // Test Add to Compare button
    await this.page.goto(url);
    await this.relatedProductAddToCompareButton.first().click();
    // Wait for notification that product was added to comparison list
    await expect(this.page.getByText(`You added product ${firstRelatedProductTitle} to the comparison list.`)).toBeVisible();
  }
}
