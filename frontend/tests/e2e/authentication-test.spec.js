// Authentication functionality test
const { test, expect } = require('@playwright/test');

test.describe('Authentication Tests', () => {
  
  test('auth page loads with correct structure', async ({ page }) => {
    await page.goto('/getstarted');
    await page.waitForLoadState('networkidle');
    
    // Check page loads
    expect(page).toHaveURL(/getstarted/);
    
    // Check tab structure exists
    const signinTab = await page.locator('button:has-text("Sign In")').count();
    const signupTab = await page.locator('button:has-text("Sign Up")').count();
    
    expect(signinTab).toBeGreaterThan(0);
    expect(signupTab).toBeGreaterThan(0);
    
    console.log('Auth page tabs present');
  });
  
  test('signin form has required fields', async ({ page }) => {
    await page.goto('/getstarted');
    await page.waitForLoadState('networkidle');
    
    // Should default to signin tab
    const emailField = await page.locator('#signin-email').count();
    const passwordField = await page.locator('#signin-password').count();
    const submitButton = await page.locator('button[type="submit"]:has-text("Sign In")').count();
    
    expect(emailField).toBe(1);
    expect(passwordField).toBe(1);
    expect(submitButton).toBe(1);
    
    console.log('Signin form fields present');
  });
  
  test('signup form has required fields', async ({ page }) => {
    await page.goto('/getstarted');
    await page.waitForLoadState('networkidle');
    
    // Switch to signup tab
    await page.locator('button:has-text("Sign Up")').click();
    await page.waitForTimeout(500);
    
    // Check signup form fields
    const emailField = await page.locator('#signup-email').count();
    const passwordField = await page.locator('#signup-password').count();
    const firstNameField = await page.locator('#first-name').count();
    const submitButton = await page.locator('button:has-text("Create Account")').count();
    
    expect(emailField).toBe(1);
    expect(passwordField).toBe(1);
    expect(firstNameField).toBe(1);
    expect(submitButton).toBe(1);
    
    console.log('Signup form fields present');
  });

});