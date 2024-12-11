import {test, expect} from '@playwright/test';
import {LoginPage} from './fixtures/login.page';
import {MainMenuPage} from './fixtures/mainmenu.page';
import {ProductPage} from './fixtures/product.page';

import slugs from './config/slugs.json';
import inputvalues from './config/input-values/input-values.json';
import selectors from './config/selectors/selectors.json';
import verify from './config/expected/expected.json';
import { CheckoutPage } from './fixtures/checkout.page';
import { AccountPage } from './fixtures/account.page';

// no resetting storageState, mainmenu has more functionalities when logged in.


test.describe('Checkout actions (logged in)', () => {
  /**
   * @feature BeforeEach runs before each test in this group.
   * @scenario Login, then add product to cart
   */

  test.beforeEach('Log in, then add product to cart', async ({ page }) => {
    // TODO: remove this beforeEach() once authentication as project set-up/fixture works.
    await test.step('Log in with account', async () =>{
      let emailInputValue = process.env.MAGENTO_EXISTING_ACCOUNT_EMAIL;
      let passwordInputValue = process.env.MAGENTO_EXISTING_ACCOUNT_PASSWORD;
      if(!emailInputValue || !passwordInputValue) {
        throw new Error("Your password variable and/or your email variable have not defined in the .env file, or the account hasn't been created yet.");
      }
      const loginPage = new LoginPage(page);
      await loginPage.login(emailInputValue, passwordInputValue);
    });

    await test.step('Add product to cart', async () =>{
      //TODO: Use a storagestate or API call to add product to the cart so shorten test time
      const productPage = new ProductPage(page);
      await page.goto(slugs.productpage.simpleProductSlug);
      await productPage.addSimpleProductToCart();
      await page.goto(slugs.checkoutSlug);
    });
  });

  test('When address is added to account, name and address should be filled in',{ tag: '@checkout',}, async ({page}) => {
    let firstName = inputvalues.accountCreation.firstNameValue;
    let lastName = inputvalues.accountCreation.lastNameValue;
    let phoneNumberValue = inputvalues.firstAddress.firstPhoneNumberValue;
    let addressValue = inputvalues.firstAddress.firstStreetAddressValue;
    let zipCodeValue = inputvalues.firstAddress.firstZipCodeValue;
    let cityNameValue = inputvalues.firstAddress.firstCityValue;
    let stateValue = inputvalues.firstAddress.firstProvinceValue;

    // TODO: create an API call to quickly add an address to the account
    if(await page.getByLabel(selectors.personalInformation.firstNameLabel).isVisible()){
      // address has not yet been added.
      const account = new AccountPage(page);
      await account.addNewAddress(phoneNumberValue, addressValue, zipCodeValue, cityNameValue, stateValue);
    }

    await expect(page.getByLabel(`${firstName} ${lastName} ${addressValue} ${cityNameValue}`),`Name and address are selected`).toBeVisible();

  });

  /**
   * @feature Order a product
   * @scenario User goes through the checkout to order a product
   * @given I am logged in 
   *  @and I have a product in my cart
   *  @and I am on the checkout page
   * @when I fill in the necessary fields
   *  @and I click 'place order'
   * @then I should see a confirmation my order was placed
   *  @and I should see an order number.
   */
  test('Place order for simple product',{ tag: '@simple-product-order',}, async ({page}) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.placeOrder();
  });

  // TODO: Write test to confirm order can be placed without an account
  // TODO: Write test for logged-in user who hasn't added an address yet.

});