// Complete Booking Flow Test (Including Stripe Payment)
const { test, expect } = require('@playwright/test');

test.describe('Complete Booking Flow with Stripe Payment', () => {
  
  test('authenticated users can complete full booking flow including Stripe payment', async ({ page }) => {
    // Increase timeout for this  test
    test.setTimeout(60000); // 60 seconds
    
    console.log('=== Complete Booking Flow Test (Including Stripe Payment) ===');
    
    // Step 1: Login with valid credentials
    console.log('Step 1: Logging in with student.p@gmail.com');
    await page.goto('/getstarted');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const emailField = await page.locator('#signin-email').count();
    if (emailField > 0) {
      await page.fill('#signin-email', 'student.p@gmail.com');
      await page.fill('#signin-password', 'test@123');
      await page.click('button[type="submit"]:has-text("Sign In")');
      await page.waitForTimeout(5000);
      console.log('Login successful');
    } else {
      throw new Error('Login form not found');
    }
    
    // Helper function to find Ming Zhao and navigate to profile
    async function findMingZhaoProfile() {
      console.log('Navigating to mentor directory to find Ming Zhao');
      await page.goto('/mentor/directory');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Look through mentor cards for Ming Zhao
      const mentorCards = await page.locator('.mentor-card, [class*="mentor"], [class*="card"], .grid > div').all();
      console.log(`Found ${mentorCards.length} mentor cards`);
      
      let mingZhaoFound = false;
      
      // Search through mentor cards for Ming Zhao
      for (let i = 0; i < Math.min(mentorCards.length, 15); i++) {
        try {
          const cardText = await mentorCards[i].textContent();
          console.log(`Card ${i + 1}: ${cardText?.substring(0, 50)}`);
          
          if (cardText?.toLowerCase().includes('ming zhao') || cardText?.toLowerCase().includes('ming') || cardText?.toLowerCase().includes('zhao')) {
            console.log(`*** Mentor found at card ${i + 1} ***`);
            
            // Click View Profile on this card
            const viewProfileButton = mentorCards[i].locator('button:has-text("View Profile")');
            if (await viewProfileButton.count() > 0) {
              await viewProfileButton.click();
              await page.waitForTimeout(3000);
              mingZhaoFound = true;
              break;
            }
          }
        } catch (error) {
          console.log(`Error checking card ${i + 1}: ${error.message}`);
        }
      }
      
      if (!mingZhaoFound) {
        console.log('Menotor not found by name, trying first available View Profile');
        // Fallback: click any View Profile button to test the flow
        const viewProfileButtons = await page.locator('button:has-text("View Profile")').count();
        if (viewProfileButtons > 0) {
          await page.locator('button:has-text("View Profile")').first().click();
          await page.waitForTimeout(3000);
          console.log('Using first available mentor profile for testing');
          return true;
        }
      } else {
        console.log('Ming Zhao profile accessed');
        return true;
      }
      
      return false;
    }
    
    // One-to-One Booking Flow
    console.log('\n=== 1 to 1 booking flow ===');
    if (await findMingZhaoProfile()) {
      console.log('Looking for One-on-One Sessions tab');
      
      // Click One-on-One Sessions tab
      const oneToOneTab = page.locator('button.session-tab:has-text("One-on-One Sessions")');
      const tabCount = await oneToOneTab.count();
      console.log(`One-on-One Sessions tab found: ${tabCount}`);
      
      if (tabCount > 0) {
        console.log('Clicking One-on-One Sessions tab');
        await oneToOneTab.first().click();
        await page.waitForTimeout(3000);
        
        // Look for "Explore Sessions" button in the one-on-one tab content
        const exploreButton = page.locator('div#one-on-one button:has-text("Explore Sessions")');
        const exploreCount = await exploreButton.count();
        console.log(`Explore Sessions button found: ${exploreCount}`);
        
        if (exploreCount > 0) {
          console.log('Clicking Explore Sessions button for one-to-one');
          await exploreButton.first().click();
          await page.waitForTimeout(5000);
          
          // Should now be on /explore/onetoone page
          const currentUrl = page.url();
          console.log('Current URL after Explore Sessions:', currentUrl);
          
          if (currentUrl.includes('/explore/onetoone')) {
            console.log('Successfully navigated to one-to-one booking page');
            
            // Now look for time slots on the one-to-one booking page
            const timeSlots = await page.locator('.bg-green-500, .bg-blue-500, [class*="available"], button:has-text("AM"), button:has-text("PM"), [class*="slot"]').count();
            console.log(`Available time slots on booking page: ${timeSlots}`);
            
            if (timeSlots > 0) {
              console.log('Selecting time slots');
              // Select first slot
              await page.locator('.bg-green-500, .bg-blue-500, [class*="available"], button:has-text("AM"), button:has-text("PM"), [class*="slot"]').first().click();
              
              // Select second slot if available
              if (timeSlots > 1) {
                await page.locator('.bg-green-500, .bg-blue-500, [class*="available"], button:has-text("AM"), button:has-text("PM"), [class*="slot"]').nth(1).click();
              }
              
              // Look for Book Sessions button
              const bookButton = page.locator('button:has-text("Book"), button:has-text("Session"), button:has-text("Book Session")');
              const bookCount = await bookButton.count();
              console.log(`Book session buttons found: ${bookCount}`);
              
              if (bookCount > 0) {
                console.log('Clicking Book Session button');
                await bookButton.first().click();
                
                // Wait for navigation to booking confirmation page
                await page.waitForFunction(() => {
                  return window.location.href.includes('booking/confirmbooking');
                }, { timeout: 10000 });
                
                const currentUrl = page.url();
                console.log('Current URL after Book Session click:', currentUrl);
                
                expect(currentUrl).toContain('booking/confirmbooking');
                console.log('Booking confirmation page reached');
                
                // ===== Complete Payment Process =====
                console.log('\n=== Payment process ===');
                
                
                console.log('Step 1: Checking "I agree" checkbox');
                const termsCheckbox = page.locator('#terms-checkbox');
                await expect(termsCheckbox).toBeVisible({ timeout: 10000 });
                await termsCheckbox.check();
                console.log('Terms checkbox checked');
                
                
                console.log('Step 2: Clicking "Pay & Confirm" button');
                const payButton = page.locator('button:has-text("Pay & Confirm"), button:has-text("🔒 Pay"), button:has-text("Pay and Confirm")');
                await expect(payButton).toBeVisible({ timeout: 10000 });
                await payButton.click();
                console.log('Pay & Confirm button clicked');
                
                console.log('Step 3: Waiting for Stripe Checkout page');
                
                await page.waitForURL('**/checkout.stripe.com/**', { timeout: 15000 });
                
                const stripeUrl = page.url();
                console.log('Current URL after Pay button:', stripeUrl);
                
                if (stripeUrl.includes('checkout.stripe.com')) {
                  console.log('Successfully redirected to Stripe Checkout');
                  
                  console.log('Step 4: Filling Stripe Checkout form');
                  
                  await page.waitForTimeout(3000);
                  
                  const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"], input[placeholder*="Email"]');
                  await expect(emailField).toBeVisible({ timeout: 10000 });
                  await emailField.fill('student.p@gmail.com');
                  console.log('Email filled');
                  
                  const cardNumberField = page.locator('input[name="cardNumber"]');
                  await expect(cardNumberField).toBeVisible({ timeout: 10000 });
                  await cardNumberField.fill('4242424242424242');
                  console.log('Card number filled');
                  
                  const expiryField = page.locator('input[placeholder="MM / YY"]');
                  await expect(expiryField).toBeVisible({ timeout: 10000 });
                  await expiryField.fill('12/25');
                  console.log('Expiry date filled');
                  
                  const cvcField = page.locator('input[placeholder="CVC"]');
                  await expect(cvcField).toBeVisible({ timeout: 10000 });
                  await cvcField.fill('123');
                  console.log('CVC filled');
                  
                  const nameField = page.locator('input[placeholder="Full name on card"]');
                  if (await nameField.count() > 0) {
                    await nameField.fill('Test User');
                    console.log('Cardholder name filled');
                  }
                  
                  const countryField = page.locator('select[name="country"], input[placeholder*="country"], input[placeholder*="Country"]');
                  if (await countryField.count() > 0) {
                    await countryField.selectOption('GB'); 
                    console.log('Country selected');
                  }
                  
                  const postalField = page.locator('input[name="postal_code"], input[placeholder*="postal"], input[placeholder*="Postal code"], input[placeholder*="ZIP"]');
                  if (await postalField.count() > 0) {
                    await postalField.fill('SW1A 1AA');
                    console.log('Postal code filled');
                  }
                  
                  const stripePayButton = page.locator('button:has-text("Pay"), button[type="submit"], button[data-testid="submit-button"]');
                  await expect(stripePayButton).toBeVisible({ timeout: 10000 });
                  await stripePayButton.click();
                  console.log('Stripe Pay button clicked');
                  
                  
                  // Wait for navigation to success page
                  await page.waitForURL('**/booking/success**', { timeout: 20000 });
                  
                  // Check if we're redirected to success page
                  const finalUrl = page.url();
                  console.log('Final URL after payment:', finalUrl);
                  
                  if (finalUrl.includes('/booking/success')) {
                    console.log('Successfully redirected to booking success page!');
                    
                    // Verify success page content
                    await page.waitForTimeout(2000);
                    const successContent = await page.locator('body').textContent();
                    
                    if (successContent?.includes('success') || successContent?.includes('confirmed') || successContent?.includes('Thank you') || successContent?.includes('Booking')) {
                      console.log('Booking success page content verified');
                      console.log('Booking flo test passed');
                    } else {
                      console.log('Success page content not as expected');
                      throw new Error('Success page content verification failed');
                    }
                  } else {
                    console.log('Not redirected to success page');
                    throw new Error('Payment completion verification failed');
                  }
                  
                } else {
                  console.log('Not redirected to Stripe Checkout');
                  throw new Error('Stripe Checkout redirection failed');
                }
                
              } else {
                console.log('No Book Session button found');
                throw new Error('No Book Session button found');
              }
            } else {
              console.log('No time slots available on booking page');
              throw new Error('No time slots available on booking page');
            }
          } else {
            console.log('Did not navigate to one-to-one booking page');
            throw new Error('Did not navigate to one-to-one booking page');
          }
        } else {
          console.log('Explore Sessions button not found in one-on-one tab');
          throw new Error('Explore Sessions button not found in one-on-one tab');
        }
      } else {
        console.log('One-on-One Sessions tab not found');
        throw new Error('One-on-One Sessions tab not found');
      }
    } else {
      console.log('Could not find Ming Zhao profile');
      throw new Error('Could not find Ming Zhao profile');
    }
  });

});
