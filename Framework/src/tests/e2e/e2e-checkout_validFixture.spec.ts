/**
 * End-to-end checkout flow:
 *   1. Log in as a standard user (standard_user / tta_secret).
 *   2. Navigate to the inventory page.
 *   3. Add the first item to the cart.
 *   4. Navigate to the cart page.
 *   5. From the cart, proceed through checkout step one and checkout step two.
 *   6. Enter the customer details and complete the order.
 */

// DataGenerated
// Fixture. - loginPage

import { test, expect} from '@fixtures/test-base'
import { DataGenerator } from '@utils/DataGenerator';
import { allureStep } from '@utils/allureSteps';


// First product card on the TTACart inventory page.
const FIRST_ITEM_ID = 'test-allthethings-tshirt-red'
test.describe('@PO @Regression E2E @Checkout Checkout Feature',()=>{
test('should complete checkout successfully', async({ page,
        validLogin,
        inventoryPage,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,})=>{
  void validLogin;
  const customer = DataGenerator.customerCheckOut()          
   // validLogin already lands on inventory, so assert it instead of reloading.
   await allureStep(page,'Inventory page: add first item to cart', async ()=>{
await inventoryPage.assertLoaded()
await inventoryPage.addToCart(FIRST_ITEM_ID)

   })
    // visualStep screenshots when its body ends, so each step opens its own
        // page first and leaves the click to the next page for the following step.
        await allureStep(page,'Cart page: verify one item in cart', async()=>{
            await cartPage.open()
            expect(await cartPage.rowCount()).toBe(1)
        })
          await allureStep(page, 'Checkout step one: enter customer details', async () => {
            await cartPage.checkout();
            await checkoutStepOnePage.assertLoaded();
            await checkoutStepOnePage.fillGuest(customer);
        });
            await allureStep(page, 'Checkout step two: review order overview', async () => {
            await checkoutStepOnePage.continue();
            await checkoutStepTwoPage.assertLoaded();
        });
        await allureStep(page,'Checkout complete: finish and verify confirmation',async()=>{
            await checkoutStepTwoPage.finish()
            await checkoutCompletePage.assertOrderComplete()
        })
})
// invalidLogin submits locked_out_user and waits for the error box, so the
    // test only has to check what the user sees and that they never got in.
     test('should reject login for a locked-out user', async ({ page, invalidLogin }) => {
       const { loginPage, username} = invalidLogin
        await allureStep(page, `Login page: ${username} sees locked-out error`, async () => {
            await loginPage.expectErrorContains('locked out');
            await expect(page).not.toHaveURL(/inventory/);
        });
    });
})
