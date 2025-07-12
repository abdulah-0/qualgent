// Example AppWright test file for login functionality
// This is a mock test file for demonstration purposes

describe('User Login Flow', () => {
  beforeEach(async () => {
    await app.launch();
    await app.clearData();
  });

  afterEach(async () => {
    await app.close();
  });

  test('should login with valid credentials', async () => {
    // Navigate to login screen
    await element(by.id('login-button')).tap();
    
    // Enter credentials
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('password123');
    
    // Submit login
    await element(by.id('submit-button')).tap();
    
    // Verify successful login
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  test('should show error for invalid credentials', async () => {
    await element(by.id('login-button')).tap();
    
    // Enter invalid credentials
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('submit-button')).tap();
    
    // Verify error message
    await expect(element(by.text('Invalid email or password'))).toBeVisible();
  });

  test('should handle forgot password flow', async () => {
    await element(by.id('login-button')).tap();
    await element(by.id('forgot-password-link')).tap();
    
    // Enter email for password reset
    await element(by.id('reset-email-input')).typeText('user@example.com');
    await element(by.id('send-reset-button')).tap();
    
    // Verify confirmation message
    await expect(element(by.text('Password reset email sent'))).toBeVisible();
  });
});
