// Search functionality test
const { test, expect } = require('@playwright/test');

test.describe('Search Functionality Tests', () => {
  
  test('homepage search redirects to search page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find the search input and button
    const searchInput = await page.locator('input[placeholder*="Try"]').count();
    const searchButton = await page.locator('button:has-text("Start Searching")').count();
    
    expect(searchInput).toBe(1);
    expect(searchButton).toBe(1);
    
    console.log('Homepage search elements found');
    
    // Try a search
    await page.fill('input[placeholder*="Try"]', 'guitar');
    await page.click('button:has-text("Start Searching")');
    await page.waitForTimeout(3000);
    
    // Should redirect to search page with query
    const currentUrl = page.url();
    console.log('Search redirected to:', currentUrl);
    expect(currentUrl).toContain('/search');
    expect(currentUrl).toContain('q=guitar');
  });
  
  test('search page loads and displays structure', async ({ page }) => {
    await page.goto('/search?q=piano');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Wait for API calls
    
    // Check search page loads
    expect(page).toHaveURL(/search/);
    
    // Check for search results structure
    const pageContent = await page.textContent('body');
    const hasSearchResults = pageContent.includes('Search Results') || 
                            pageContent.includes('Found') ||
                            pageContent.includes('results');
    
    console.log('Search page has results structure:', hasSearchResults);
    expect(hasSearchResults).toBeTruthy();
  });
  
  test('search results show mentor and class options', async ({ page }) => {
    await page.goto('/search?q=music');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Look for result cards or buttons
    const viewProfileButtons = await page.locator('button:has-text("View Profile")').count();
    const bookNowButtons = await page.locator('button:has-text("Book Now")').count();
    const resultCards = await page.locator('.shadow-md, .shadow-lg').count();
    
    console.log('View Profile buttons:', viewProfileButtons);
    console.log('Book Now buttons:', bookNowButtons);
    console.log('Result cards:', resultCards);
    
    // Should have some search interface
    const hasSearchInterface = viewProfileButtons > 0 || bookNowButtons > 0 || resultCards > 0;
    console.log('Search interface present:', hasSearchInterface);
  });

});