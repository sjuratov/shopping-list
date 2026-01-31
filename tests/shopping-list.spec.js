const { test, expect } = require('@playwright/test');

test.describe('Shopping List App', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Check main sections are visible
    await expect(page.locator('h1').filter({ hasText: 'AI Assistant' })).toBeVisible();
    await expect(page.locator('h1').filter({ hasText: 'My Lists' })).toBeVisible();
    // Title changes based on selected list
    await expect(page.locator('#activeListTitle')).toBeVisible();
  });

  test('should display welcome message in chat', async ({ page }) => {
    await page.goto('/');
    
    // Check for welcome message
    await expect(page.locator('.message.assistant')).toContainText("Hi! I'm your AI shopping assistant");
  });

  test('should create a new shopping list manually', async ({ page }) => {
    await page.goto('/');
    
    // Type new list name
    await page.fill('#newListInput', 'Test Groceries');
    await page.click('#addListBtn');
    
    // Verify list appears in the lists manager
    await expect(page.locator('.list-name-item')).toContainText('Test Groceries');
    await expect(page.locator('.list-name-item')).toHaveClass(/active/);
    
    // Verify active list title updated
    await expect(page.locator('#activeListTitle')).toContainText('Test Groceries');
  });

  test('should rename a shopping list', async ({ page }) => {
    await page.goto('/');
    
    // Create a list first
    await page.fill('#newListInput', 'Original Name');
    await page.click('#addListBtn');
    
    // Click rename button
    await page.click('.list-name-item .rename-btn');
    
    // Change the name
    await page.fill('.list-name-input', 'Updated Name');
    await page.click('.save-btn');
    
    // Verify name changed
    await expect(page.locator('.list-name-item')).toContainText('Updated Name');
  });

  test('should delete a shopping list', async ({ page }) => {
    await page.goto('/');
    
    // Create two lists
    await page.fill('#newListInput', 'List 1');
    await page.click('#addListBtn');
    
    await page.fill('#newListInput', 'List 2');
    await page.click('#addListBtn');
    
    // Delete the active list
    page.on('dialog', dialog => dialog.accept());
    await page.click('.list-name-item.active .delete-list-btn');
    
    // Verify list was deleted
    await expect(page.locator('.list-name-item').filter({ hasText: 'List 2' })).not.toBeVisible();
    await expect(page.locator('.list-name-item').filter({ hasText: 'List 1' })).toBeVisible();
  });

  test('should switch between shopping lists', async ({ page }) => {
    await page.goto('/');
    
    // Create two lists
    await page.fill('#newListInput', 'List A');
    await page.click('#addListBtn');
    
    await page.fill('#newListInput', 'List B');
    await page.click('#addListBtn');
    
    // List B should be active
    await expect(page.locator('#activeListTitle')).toContainText('List B');
    
    // Click on List A
    await page.click('.list-name-item:has-text("List A")');
    
    // Verify List A is now active
    await expect(page.locator('#activeListTitle')).toContainText('List A');
    await expect(page.locator('.list-name-item:has-text("List A")')).toHaveClass(/active/);
  });

  test('should create a new chat session', async ({ page }) => {
    await page.goto('/');
    
    // Open session dropdown and create new session
    await page.click('#currentSessionBtn');
    
    // Count current sessions
    const sessionsBefore = await page.locator('.session-item').count();
    
    await page.click('#newSessionBtn');
    
    // Verify new session was created (one more session)
    await page.click('#currentSessionBtn');
    const sessionsAfter = await page.locator('.session-item').count();
    expect(sessionsAfter).toBe(sessionsBefore + 1);
    
    // Verify welcome message appears
    await expect(page.locator('.message.assistant').last()).toContainText("Hi! I'm your AI shopping assistant");
  });

  test('should switch between chat sessions', async ({ page }) => {
    await page.goto('/');
    
    // Create a second session
    await page.click('#currentSessionBtn');
    await page.click('#newSessionBtn');
    
    // Now we should have 2 sessions, and session 2 should be active
    await page.click('#currentSessionBtn');
    const session2 = page.locator('.session-item.active');
    await expect(session2).toBeVisible();
    
    // Click on the non-active session (session 1)
    await page.click('.session-item:not(.active)');
    
    // Verify we switched - now session 1 should be active
    await page.click('#currentSessionBtn');
    const sessionsAfterSwitch = await page.locator('.session-item.active').count();
    expect(sessionsAfterSwitch).toBe(1);
  });

  test('should delete a chat session', async ({ page }) => {
    await page.goto('/');
    
    // Create a second session
    await page.click('#currentSessionBtn');
    await page.click('#newSessionBtn');
    
    // Open dropdown and delete the active session
    await page.click('#currentSessionBtn');
    page.on('dialog', dialog => dialog.accept());
    await page.click('.session-item.active .delete-session-btn');
    
    // Verify session was deleted and we're in another session
    await expect(page.locator('#currentSessionName')).toBeVisible();
  });

  test('should persist active session on page refresh', async ({ page }) => {
    await page.goto('/');
    
    // Create a new session
    await page.click('#currentSessionBtn');
    await page.click('#newSessionBtn');
    
    const sessionName = await page.locator('#currentSessionName').textContent();
    
    // Reload page
    await page.reload();
    
    // Verify same session is active
    const reloadedSessionName = await page.locator('#currentSessionName').textContent();
    expect(reloadedSessionName).toBe(sessionName);
  });

  test('should persist shopping lists on page refresh', async ({ page }) => {
    await page.goto('/');
    
    // Create a list
    await page.fill('#newListInput', 'Persistent List');
    await page.click('#addListBtn');
    
    // Reload page
    await page.reload();
    
    // Verify list still exists
    await expect(page.locator('.list-name-item')).toContainText('Persistent List');
  });

  test('should display empty state when no items in list', async ({ page }) => {
    await page.goto('/');
    
    // Create a list first
    await page.fill('#newListInput', 'Empty List');
    await page.click('#addListBtn');
    
    // Should show empty state in the shopping list section with items
    await expect(page.locator('#shoppingList .empty-state')).toContainText('Your shopping list is empty');
  });

  test('should show empty state message when no lists exist', async ({ page }) => {
    await page.goto('/');
    
    // If there are any lists, delete them all
    const listCount = await page.locator('.list-name-item').count();
    if (listCount > 0) {
      page.on('dialog', dialog => dialog.accept());
      for (let i = 0; i < listCount; i++) {
        await page.click('.list-name-item .delete-list-btn');
      }
    }
    
    // Should show no list selected message
    await expect(page.locator('#shoppingList .empty-state')).toContainText('No shopping lists');
  });

  test('should display chat input and send button', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('#chatInput')).toBeVisible();
    await expect(page.locator('#chatInput')).toHaveAttribute('placeholder', 'Tell me what you need to buy...');
    await expect(page.locator('#sendBtn')).toBeVisible();
    await expect(page.locator('#sendBtn')).toContainText('Send');
  });

  test('should show stats with correct item count', async ({ page }) => {
    await page.goto('/');
    
    // Initially should show 0 items
    await expect(page.locator('#totalItems')).toContainText('0');
  });

  test('should display list name in lists manager with item count', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#newListInput', 'My List');
    await page.click('#addListBtn');
    
    // Should show list with (0) items
    await expect(page.locator('.list-name-item')).toContainText('My List');
    await expect(page.locator('.list-name-item')).toContainText('(0)');
  });

  test('should have responsive layout with three columns', async ({ page }) => {
    await page.goto('/');
    
    // Check that all three main sections exist
    const chatSection = page.locator('.chat-section');
    const listsSection = page.locator('.lists-manager-section');
    const itemsSection = page.locator('.list-section');
    
    await expect(chatSection).toBeVisible();
    await expect(listsSection).toBeVisible();
    await expect(itemsSection).toBeVisible();
  });

  test('should have session selector dropdown functionality', async ({ page }) => {
    await page.goto('/');
    
    // Dropdown should be hidden initially
    await expect(page.locator('#sessionDropdown')).not.toHaveClass(/show/);
    
    // Click to open
    await page.click('#currentSessionBtn');
    await expect(page.locator('#sessionDropdown')).toHaveClass(/show/);
    
    // Click outside to close
    await page.click('body', { position: { x: 10, y: 10 } });
    await expect(page.locator('#sessionDropdown')).not.toHaveClass(/show/);
  });
});
