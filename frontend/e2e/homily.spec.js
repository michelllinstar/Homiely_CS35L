const { test, expect } = require('@playwright/test');

const TEST_EMAIL    = 'jerry@example.com';
const TEST_PASSWORD = 'password123';

// ---------------------------------------------------------------------------
// Helper: log in and return once the home page has loaded.
// Reused by both tests so login logic is not duplicated.
// ---------------------------------------------------------------------------
async function loginAsTestUser(page) {
    await page.goto('/');

    // If already redirected to /home, login is not needed.
    if (page.url().includes('/home')) return;

    await page.goto('/login');
    await page.getByPlaceholder('email@g.ucla.edu').fill(TEST_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Wait until navigation away from /login completes.
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
}

// ---------------------------------------------------------------------------
// Test 1: Login flow
// Verifies that a registered user can log in and reach the home page.
// Covers: frontend form submission → POST /api/login → JWT issued → redirect.
// ---------------------------------------------------------------------------
test('registered user can log in and reach the home page', async ({ page }) => {
    await page.goto('/login');

    // Fill credentials and submit.
    await page.getByPlaceholder('email@g.ucla.edu').fill(TEST_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // After a successful login the app navigates to /home or /group-setup.
    // Either destination confirms the backend accepted the credentials.
    await page.waitForURL(
        (url) => url.pathname.includes('/home') || url.pathname.includes('/group-setup'),
        { timeout: 10000 }
    );

    const path = new URL(page.url()).pathname;
    expect(['/home', '/group-setup']).toContain(path);
});

// ---------------------------------------------------------------------------
// Test 2: Add a chore end-to-end
// Verifies that a logged-in user can create a chore and see it appear in the
// chore list, confirming the full round trip:
// frontend form → POST /api/groups/:id/chores → DB write → GET re-fetch → UI render.
// ---------------------------------------------------------------------------
test('logged-in user can add a chore and see it in the list', async ({ page }) => {
    await loginAsTestUser(page);

    // Navigate to the Chores page.
    await page.goto('/chores');
    await page.waitForLoadState('networkidle');

    // Open the Add Chore form by clicking the toggle button.
    await page.getByRole('button', { name: 'Add Chore' }).click();

    // Fill in a unique description so the assertion is unambiguous.
    const choreDescription = `Test chore ${Date.now()}`;
    await page.getByPlaceholder('e.g. Vacuum living room').fill(choreDescription);

    // Select the first available roommate from the dropdown.
    await page.locator('select').first().selectOption({ index: 1 });

    // Submit the form.
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    // The new chore should appear somewhere on the page.
    await expect(page.getByText(choreDescription)).toBeVisible({ timeout: 8000 });
});