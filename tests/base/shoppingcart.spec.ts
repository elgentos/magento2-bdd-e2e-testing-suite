import { test, expect } from '@playwright/test';
import {productTest} from './fixtures/fixtures';
import {ProductPage} from './poms/product.page';
import {LoginPage} from './poms/login.page';
import {CartPage} from './poms/shoppingcart.page';

import slugs from './config/slugs.json';
import UIReference from './config/element-identifiers/element-identifiers.json';

test.describe('Product in cart tests', {tag: '@cart-product-group'}, () => {
  /**
   * @feature Add product to cart
   * @scenario User adds a product to their cart
   * @given I am on any page
   * @when I navigate to a (simple) product page
   * @and I click the 'add to cart' button
   * @then I should see a notification the product has been added
   * @and when I navigate to the cart
   * @then I should see the product in my cart
   */
  test('Add_simple_product_to_cart', {tag: '@cart'}, async ({page}) => {
    const productPage = new ProductPage(page);
    await productPage.addSimpleProductToCart(UIReference.productPage.simpleProductTitle, slugs.productpage.simpleProductSlug);
    await page.goto(slugs.cartSlug);
    await expect(page.getByRole('strong').getByRole('link', {name: UIReference.productPage.simpleProductTitle}), `Product is visible in cart`).toBeVisible();
  });

  /** 
   * @feature Remove product from cart
   * @scenario User adds a product to their cart, then deletes it
   * @given I add a product to my cart
   * @when I navigate to the cart page
   * @and I click the delete button
   * @then I should see a notification that the product has been removed from my cart
   *  @and I should no longer see the product in my cart
   */
  productTest('Remove_simple_product_from_cart', {tag: '@cart'}, async ({productPage}) => {
    const cartPage = new CartPage(productPage.page);
    await cartPage.removeProduct(UIReference.productPage.simpleProductTitle);
    // Add product again for the teardown
    // TODO: Create fix so that the product does not have to be added again
    await productPage.productPage.addSimpleProductToCart(UIReference.productPage.simpleProductTitle, slugs.productpage.simpleProductSlug);
  });

  /**
   * @feature Change quantity of products in cart
   * @scenario User has added a product and changes the quantity
   * @given I have a product in my cart
   * @and I am on the cart page
   * @when I change the quantity of the product
   * @and I click the update button
   * @then the quantity field should have the new amount
   * @and the subtotal/grand total should update
   */
  productTest('Change_quantity_of_simple_product_in_cart', {tag: '@cart'}, async ({productPage}) => {
    await productPage.page.goto(slugs.cartSlug);
    await productPage.cartPage.changeProductQuantity('2');
  });

  /**
   * @feature Product permanence after login
   * @scenario A product added to the cart should still be there after user has logged in
   * @given I have a product in my cart
   * @when I log in
   * @then I should still have that product in my cart
   */
  test('Product_remains_in_cart_after_login',{ tag: ['@cart', '@account']}, async ({page, browserName}) => {
    await test.step('Add product to cart', async () =>{
      const productpage = new ProductPage(page);
      await page.goto(slugs.productpage.simpleProductSlug);
      await productpage.addSimpleProductToCart(UIReference.productPage.simpleProductTitle, slugs.productpage.simpleProductSlug);
    });

    await test.step('Log in with account', async () =>{
      const browserEngine = browserName?.toUpperCase() || "UNKNOWN";
      const loginPage = new LoginPage(page);
      let emailInputValue = process.env[`MAGENTO_EXISTING_ACCOUNT_EMAIL_${browserEngine}`];
      let passwordInputValue = process.env.MAGENTO_EXISTING_ACCOUNT_PASSWORD;

      if(!emailInputValue || !passwordInputValue) {
        throw new Error("MAGENTO_EXISTING_ACCOUNT_EMAIL_${browserEngine} and/or MAGENTO_EXISTING_ACCOUNT_PASSWORD have not defined in the .env file, or the account hasn't been created yet.");
      }

      await loginPage.login(emailInputValue, passwordInputValue);
    });

    await page.goto(slugs.cartSlug);
    await expect(page.getByRole('strong').getByRole('link', { name: UIReference.productPage.simpleProductTitle }),`${UIReference.productPage.simpleProductTitle} should still be in cart`).toBeVisible();
  });
}); // End of product in cart group

test.describe('Coupon in cart tests', {tag: '@cart-coupon-group'}, () => {
  /**
   * @feature Discount Code (cart)
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
  productTest('Add_coupon_code_in_cart', {tag: ['@cart']}, async ({productPage, browserName}) => {
    await productPage.page.goto(slugs.cartSlug);

    const browserEngine = browserName?.toUpperCase() || "UNKNOWN";
    let discountCode = process.env[`MAGENTO_COUPON_CODE_${browserEngine}`];
    if(!discountCode) {
      throw new Error(`MAGENTO_COUPON_CODE_${browserEngine} appears to not be set in .env file. Value reported: ${discountCode}`);
    }

    await productPage.cartPage.applyDiscountCode(discountCode);
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
  productTest('Remove_coupon_code_from_cart', {tag: ['@cart']}, async ({productPage, browserName}) => {
    await productPage.page.goto(slugs.cartSlug);
    const browserEngine = browserName?.toUpperCase() || "UNKNOWN";
    let discountCode = process.env[`MAGENTO_COUPON_CODE_${browserEngine}`];
    if(!discountCode) {
      throw new Error(`MAGENTO_COUPON_CODE_${browserEngine} appears to not be set in .env file. Value reported: ${discountCode}`);
    }

    await productPage.cartPage.applyDiscountCode(discountCode);
    await productPage.cartPage.removeDiscountCode();
  });

  /**
   * @feature Incorrect discount code check
   * @scenario The user provides an incorrect discount code, the system should reflect that
   * @given I have a product in my cart
   * @and I am on the cart page
   * @when I enter a wrong discount code
   * @then I should get a notification that the code did not work.
   */
  productTest('Invalid_coupon_code_is_rejected', {tag: ['@cart']}, async ({productPage}) => {
    await productPage.page.goto(slugs.cartSlug);
    await productPage.cartPage.enterWrongCouponCode("Incorrect Coupon Code");
  });
}); // end of coupon in cart group

test.describe('Price checking tests', {tag: '@cart-price-group'}, () => {
  /**
   * @feature Simple Product price/amount check from PDP to Checkout
   * @given none
   * @when I go to a (simple) product page
   *  @and I add one or more to my cart
   * @when I go to the checkout
   * @then the amount of the product should be the same
   *  @and the price in the checkout should equal the price of the product * the amount of the product
   */
  test('Simple_product_values_are_consistent_from_PDP_to_checkout',{ tag: '@cart-price-check',}, async ({page}) => {
    var productPagePrice: string;
    var productPageAmount: string;
    var checkoutProductDetails: string[];

    const cart = new CartPage(page);

    await test.step('Step: Add simple product to cart', async () =>{
      const productPage = new ProductPage(page);
      await page.goto(slugs.productpage.simpleProductSlug);
      // set quantity to 2 so we can see that the math works
      await page.getByLabel(UIReference.productPage.quantityFieldLabel).fill('2');
  
      productPagePrice = await page.locator(UIReference.productPage.simpleProductPrice).innerText();
      productPageAmount = await page.getByLabel(UIReference.productPage.quantityFieldLabel).inputValue();
      await productPage.addSimpleProductToCart(UIReference.productPage.simpleProductTitle, slugs.productpage.simpleProductSlug, '2');

    });

    await test.step('Step: go to checkout, get values', async () =>{
      await page.goto(slugs.checkoutSlug);
      await page.waitForLoadState();

      // returns productPriceInCheckout and productQuantityInCheckout
      checkoutProductDetails = await cart.getCheckoutValues(UIReference.productPage.simpleProductTitle, productPagePrice, productPageAmount);
    });

    await test.step('Step: Calculate and check expectations', async () =>{
      await cart.calculateProductPricesAndCompare(productPagePrice, productPageAmount, checkoutProductDetails[0], checkoutProductDetails[1]);
    });
    
  });

  /**
   * @feature Configurable Product price/amount check from PDP to Checkout
   * @given none
   * @when I go to a (configurable) product page
   *  @and I add one or more to my cart
   * @when I go to the checkout
   * @then the amount of the product should be the same
   *  @and the price in the checkout should equal the price of the product * the amount of the product
   */
  test('Configurable_product_values_are_consistent_from_PDP_to_checkout',{ tag: '@cart-price-check',}, async ({page}) => {
    var productPagePrice: string;
    var productPageAmount: string;
    var checkoutProductDetails: string[];

    const cart = new CartPage(page);

    await test.step('Step: Add configurable product to cart', async () =>{
      const productPage = new ProductPage(page);
      await page.goto(slugs.productpage.configurableProductSlug);
      // set quantity to 2 so we can see that the math works
      await page.getByLabel('Quantity').fill('2');
  
      productPagePrice = await page.locator(UIReference.productPage.simpleProductPrice).innerText();
      productPageAmount = await page.getByLabel(UIReference.productPage.quantityFieldLabel).inputValue();
      await productPage.addConfigurableProductToCart();

    });

    await test.step('Step: go to checkout, get values', async () =>{
      await page.goto(slugs.checkoutSlug);
      await page.waitForLoadState();

      // returns productPriceInCheckout and productQuantityInCheckout
      checkoutProductDetails = await cart.getCheckoutValues(UIReference.productPage.configurableProductTitle, productPagePrice, productPageAmount);
    });

    await test.step('Step: Calculate and check expectations', async () =>{
      await cart.calculateProductPricesAndCompare(productPagePrice, productPageAmount, checkoutProductDetails[0], checkoutProductDetails[1]);
    });
    
  });
}); // End of price checking group