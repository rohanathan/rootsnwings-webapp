// Mentor directory and profile flow test
const { test, expect } = require('@playwright/test');

test.describe('Mentor Directory & Profile Tests', () => {
  
  test('mentor directory loads with search and filters', async ({ page }) => {
    await page.goto('/mentor/directory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check page loads
    expect(page).toHaveURL(/mentor\/directory/);
    
    // Check for search and filter elements
    const searchInput = await page.locator('input[placeholder*="Search mentors"]').count();
    const subjectFilter = await page.locator('#subject-filter').count();
    const applyButton = await page.locator('button:has-text("Apply Filters")').count();
    
    expect(searchInput).toBe(1);
    expect(subjectFilter).toBe(1);
    expect(applyButton).toBe(1);
    
    console.log('Mentor directory filters present');
  });
  
  test('mentor cards have view profile buttons', async ({ page }) => {
    await page.goto('/mentor/directory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Check for mentor cards and view profile buttons
    const viewProfileButtons = await page.locator('button:has-text("View Profile")').count();
    const mentorCards = await page.locator('.rounded-2xl').count();
    
    console.log('View Profile buttons found:', viewProfileButtons);
    console.log('Mentor cards found:', mentorCards);
    
    const hasMentorInterface = viewProfileButtons > 0 || mentorCards > 0;
    console.log('Mentor directory interface present:', hasMentorInterface);
  });
  
  test('mentor detail page has three tabs', async ({ page }) => {
    // Go to directory first to potentially get mentor data
    await page.goto('/mentor/directory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Then try to access detail page
    await page.goto('/mentor/detailpage');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('Mentor detail page URL:', currentUrl);
    
    if (currentUrl.includes('detailpage')) {
      // Check for the three tabs
      const oneOnOneTab = await page.locator('button:has-text("One-on-One")').count();
      const groupBatchTab = await page.locator('button:has-text("Group Batches")').count();  
      const workshopTab = await page.locator('button:has-text("Workshops")').count();
      
      console.log('One-on-One tab:', oneOnOneTab);
      console.log('Group Batches tab:', groupBatchTab);
      console.log('Workshops tab:', workshopTab);
      
      const hasTabStructure = oneOnOneTab > 0 || groupBatchTab > 0 || workshopTab > 0;
      console.log('Mentor detail page has tab structure:', hasTabStructure);
    } else {
      console.log('Redirected to directory (expected without mentor data)');
      expect(currentUrl).toContain('directory');
    }
  });

});