import { test, expect } from '@playwright/test';
import { ProductPage } from './fixtures/product.page';
import { MainMenuPage } from './fixtures/mainmenu.page';
import { CartPage} from './fixtures/cart.page';

import slugs from './config/slugs.json';
import selectors from './config/selectors/selectors.json';
import verify from './config/expected/expected.json';

test.describe('Cart functionalities', () => {
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
    await page.goto(slugs.cartSlug);
  });

  /** 
   *  @feature Remove product from cart
   *  @scenario User has added a product and wants to remove it from the cart page
   *  @given I have added a product to my cart
   *    @and I am on the cart page
   *  @when I click the delete button
   *  @then I should see a notification that the product has been removed from my cart
   */

  test('Product can be added to cart',{ tag: '@cart',}, async ({page}) => {
    await expect(page.getByRole('strong').getByRole('link', {name: selectors.productPage.simpleProductTitle}), `Product is visible in cart`).toBeVisible();
  });
  
  /**
   * @feature Remove product from cart
   * @scenario User has added a product and wants to remove it from the cart page
   * @given I have added a product to my cart
   *  @and I am on the cart page
   * @when I click the delete button
   * @then I should see a notification that the product has been removed from my cart
   *  @and I should no longer see the product in my cart
   */
  test('Remove product from cart',{ tag: '@cart',}, async ({page}) => {
    const cart = new CartPage(page);
    await cart.removeProduct(selectors.productPage.simpleProductTitle);
  });


  /**
   * @feature Discount Code
   * @scenario User adds a discount code to their cart
   * @given I have a product in my cart
   *  @and I am on my cart page
   * @when I click on the 'add discount code' button
   * @then I fill in a code
   *  @and I click on 'apply code'
   * @then I should see a confirmation that my code has been added
   *  @and the code should be visible in the cart
   *  @and a discount should be applied to the product
   */
  test('Add coupon code in cart',{ tag: ['@cart', '@coupon-code']}, async ({page}) => {
    const cart = new CartPage(page);
    let discountCode = process.env.MAGENTO_COUPON_CODE;

    if(!discountCode) {
      throw new Error(`MAGENTO_COUPON_CODE appears to not be set in .env file. Value reported: ${discountCode}`);
    }

    await cart.applyDiscountCode(discountCode);
  });

  /**
   * @feature Remove discount code from cart
   * @scenario User has added a discount code, then removes it
   * @given I have a product in my cart
   * @and I am on my cart page
   * @when I add a discount code
   * @then I should see a notification
   * @and the code should be visible in the cart
   * @and a discount should be applied to a product
   * @when I click the 'cancel coupon' button
   * @then I should see a notification the discount has been removed
   * @and the discount should no longer be visible.
   */
  test('Remove coupon code from cart',{ tag: ['@cart', '@coupon-code'] }, async ({page}) => {
    const cart = new CartPage(page);
    let discountCode = process.env.MAGENTO_COUPON_CODE;

    if(!discountCode) {
      throw new Error(`discountCode appears to not be set in .env file. Value reported: ${discountCode}`);
    }

    // TODO: create API call to quickly add discount code rather than run a test again.
    await cart.applyDiscountCode(discountCode);
    await cart.removeDiscountCode();
  });


  /**
   * @feature Incorrect discount code check
   * @scenario The user provides an incorrect discount code, the system should reflect that
   * @given I have a product in my cart
   * @and I am on the cart page
   * @when I enter a wrong discount code
   * @then I should get a notification that the code did not work.
   */

  test('Using an invalid coupon code should give an error',{ tag: ['@cart', '@coupon-code'] }, async ({page}) => {
    const cart = new CartPage(page);
    let wrongDiscountCode = "incorrect discount code";
    
    await cart.enterWrongCouponCode(wrongDiscountCode);
  });
})
