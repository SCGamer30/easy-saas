import { test, expect } from '@playwright/test'

test.describe('smoke', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).not.toHaveTitle(/error/i)
    // No JS errors on initial load
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
  })

  test('sign-in page is reachable', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('body')).toBeVisible()
  })

  test('dashboard redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard')
    // Clerk redirects to /sign-in when not logged in
    await expect(page).toHaveURL(/sign-in/)
  })

  test('404 page renders', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist')
    expect(response?.status()).toBe(404)
  })
})
