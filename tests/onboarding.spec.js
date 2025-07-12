// Example AppWright test file for onboarding flow
// This is a mock test file for demonstration purposes

describe('User Onboarding Flow', () => {
  beforeEach(async () => {
    // Setup test environment
    await app.launch();
    await app.clearData();
  });

  afterEach(async () => {
    // Cleanup after each test
    await app.close();
  });

  test('should complete welcome screen', async () => {
    // Navigate through welcome screens
    await element(by.id('welcome-screen')).toBeVisible();
    await element(by.id('next-button')).tap();
    
    await element(by.id('features-screen')).toBeVisible();
    await element(by.id('next-button')).tap();
    
    await element(by.id('permissions-screen')).toBeVisible();
    await element(by.id('allow-button')).tap();
  });

  test('should create new account', async () => {
    // Skip welcome screens
    await element(by.id('skip-button')).tap();
    
    // Fill registration form
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('SecurePass123!');
    await element(by.id('confirm-password-input')).typeText('SecurePass123!');
    
    // Submit form
    await element(by.id('register-button')).tap();
    
    // Verify success
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  test('should handle invalid email', async () => {
    await element(by.id('skip-button')).tap();
    
    // Enter invalid email
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.id('password-input')).typeText('SecurePass123!');
    await element(by.id('register-button')).tap();
    
    // Verify error message
    await expect(element(by.id('email-error'))).toBeVisible();
    await expect(element(by.text('Please enter a valid email address'))).toBeVisible();
  });
});
