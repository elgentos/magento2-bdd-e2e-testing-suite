import {test, expect} from '@playwright/test';
import {MainMenuPage} from './fixtures/mainmenu.page';
import {ProductPage} from './fixtures/product.page';
import { MiniCartPage } from './fixtures/minicart.page';

import slugs from './config/slugs.json';
import inputvalues from './config/input-values/input-values.json';
import selectors from './config/selectors/selectors.json';
import verify from './config/expected/expected.json';

test.describe('Minicart Actions', {annotation: {type: 'Minicart', description: 'Minicart simple product tests'},}, () => {
  
  /**
   * @feature BeforeEach runs before each test in this group.
   * @scenario Add a product to the cart and confirm it's there.
   * @given I am on any page
   * @when I navigate to a (simple) product page
   *  @and I add it to my cart
   *  @then I should see a notification
   * @when I click the cart in the main menu
   *  @then the minicart should become visible
   *  @and I should see the product in the minicart
   */
  test.beforeEach(async ({ page }) => {
    const mainMenu = new MainMenuPage(page);
    const productPage = new ProductPage(page);

    //TODO: Use a storagestate or API call to add product to the cart so shorten test time
    await page.goto(slugs.productpage.simpleProductSlug);
    await productPage.addSimpleProductToCart();
    await mainMenu.openMiniCart();
    await expect(page.getByText(verify.miniCart.simpleProductInCartTitle)).toBeVisible();
  });

  /**
   * @feature Magento 2 Minicart to Checkout
   * @scenario User adds a product to cart, then uses minicart to navigate to checkout
   * @given I have added a (simple) product to the cart and opened the minicart
   * @when I click on the 'to checkout' button
   *  @then I should navigate to the checkout page
   */

  test('Add product to minicart, navigate to checkout',{ tag: '@minicart-simple-product',}, async ({page}) => {
    const miniCart = new MiniCartPage(page);
    await miniCart.goToCheckout();
  });

  /**
   * @feature Magento 2 Minicart to Cart
   * @scenario User adds a product to cart, then uses minicart to navigate to their cart
   * @given I have added a (simple) product to the cart and opened the minicart
   * @when I click on the 'to cart' link
   * @then I should be navigated to the cart page
   */

  test('Add product to minicart, navigate to cart',{ tag: '@minicart-simple-product',}, async ({page}) => {
    const miniCart = new MiniCartPage(page);
    await miniCart.goToCart();
  });

  /**
   * @feature Magento 2 Minicart quantity change
   * @scenario User adds a product to the minicart, then changes the quantity using the minicart
   * @given I have added a (simple) product to the cart and opened the minicart
   * @when I click on the pencil for the product I want to update
   *  @then I should navigate to a product page that is in my cart
   * @when I change the amount
   *  @and I click the 'update item' button
   *  @then I should see a confirmation
   *    @and the new amount should be shown in the minicart
   */
  test('Change quantity of a product in minicart',{ tag: '@minicart-simple-product',}, async ({page}) => {
    const miniCart = new MiniCartPage(page);
    await miniCart.updateProduct('3');
  });

  /**
   * @feature Magento 2 minicart product deletion
   * @scenario User adds product to cart, then removes from minicart
   * @given I have added a (simple) product to the cart and opened the minicart
   * @when I click on the delete button
   *  @then The product should not be in my cart anymore
   *  @and I should see a notification that the product was removed
   */
  test('Delete product from minicart',{ tag: '@minicart-simple-product',}, async ({page}) => {
    const miniCart = new MiniCartPage(page);
    await miniCart.removeProductFromMinicart();
  });

  /**
   * @feature Price Check: Simple Product on Product Detail Page (PDP) and Minicart
   * @scenario The price on a PDP should be the same as the price in the minicart
   * @given I have added a (simple) product to the cart and opened the minicart
   * @then the price listed in the minicart (per product) should be the same as the price on the PDP
  */
  test('Price on PDP is the same as price in Minicart',{ tag: '@minicart-simple-product',}, async ({page}) => {
    const miniCart = new MiniCartPage(page);
    await miniCart.checkPriceWithProductPage();
  });
});

test.describe('Minicart Actions', {annotation: {type: 'Minicart', description: 'Minicart configurable product tests'},}, () => {
  /**
   * @feature BeforeEach runs before each test in this group.
   * @scenario Add a configurable product to the cart and confirm it's there.
   * @given I am on any page
   * @when I navigate to a (simple) product page
   *  @and I add it to my cart
   *  @then I should see a notification
   * @when I click the cart in the main menu
   *  @then the minicart should become visible
   *  @and I should see the product in the minicart
   */
  test.beforeEach(async ({ page }) => {
    const mainMenu = new MainMenuPage(page);
    const productPage = new ProductPage(page);

    //TODO: Use a storagestate or API call to add product to the cart so shorten test time
    await page.goto(slugs.productpage.configurableProductSlug);
    await productPage.addConfigurableProductToCart();
    await mainMenu.openMiniCart();
    await expect(page.getByText(verify.miniCart.configurableProductMinicartTitle)).toBeVisible();
  });

  /**
   * @feature Price Check: Configurable Product on Product Detail Page (PDP) and Minicart
   * @scenario The price on a PDP should be the same as the price in the minicart
   * @given I have added a (configurable) product to the cart and opened the minicart
   * @then the price listed in the minicart (per product) should be the same as the price on the PDP
  */
  test('Price configurable PDP is same as price in Minicart',{ tag: '@minicart-simple-product',}, async ({page}) => {
    const miniCart = new MiniCartPage(page);
    await miniCart.checkPriceWithProductPage();
  });
});