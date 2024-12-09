import {test, expect} from '@playwright/test';
import {ProductPage} from './fixtures/product.page';
import { MainMenuPage } from './fixtures/mainmenu.page';

import slugs from './config/slugs.json';
import verify from './config/expected/expected.json';

test.describe('Coupon Code tests', () => {
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

  test('Add coupon code in cart',{ tag: ['@cart', '@coupon-code']}, async ({page}) => {
    
  });
});

//TODO: Write test to add coupon
//TODO: Write test to remove coupon