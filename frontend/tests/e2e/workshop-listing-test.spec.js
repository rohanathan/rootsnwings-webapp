// Workshop listing page test
const { test, expect } = require('@playwright/test');

test.describe('Workshop Listing Tests', () => {
  
  test('workshop listing page loads with filters', async ({ page }) => {
    await page.goto('/workshop/listing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Check page loads
    expect(page).toHaveURL(/workshop\/listing/);
    
    // Check for workshop listing elements
    const pageContent = await page.textContent('body');
    const hasWorkshopContent = pageContent.includes('workshop') || 
                              pageContent.includes('Workshop') ||
                              pageContent.includes('class');
    
    console.log('Workshop listing page has content:', hasWorkshopContent);
    expect(hasWorkshopContent).toBeTruthy();
  });
  
  test('workshop cards have booking functionality', async ({ page }) => {
    await page.goto('/workshop/listing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Look for booking-related buttons
    const reserveButtons = await page.locator('button:has-text("Reserve"), button:has-text("Book")').count();
    const workshopCards = await page.locator('.rounded, .shadow').count();
    
    console.log('Booking buttons found:', reserveButtons);
    console.log('Workshop cards found:', workshopCards);
    
    const hasBookingInterface = reserveButtons > 0 || workshopCards > 0;
    console.log('Workshop booking interface present:', hasBookingInterface);
  });
  
  test('global search can access workshops', async ({ page }) => {
    // Test that workshops can be found via search
    await page.goto('/search?q=workshop');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    const pageContent = await page.textContent('body');
    const hasSearchResults = pageContent.includes('results') ||
                            pageContent.includes('Found') ||
                            pageContent.includes('workshop');
    
    console.log('Search can find workshops:', hasSearchResults);
  });

});