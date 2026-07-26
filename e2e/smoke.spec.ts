import { test, expect } from '@playwright/test'

const run = process.env.PLAYWRIGHT === '1'

;(run ? test : test.skip)('home / buscar / reportar smoke', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toBeVisible()

  await page.goto('/buscar')
  await expect(page.locator('body')).toBeVisible()

  await page.goto('/reportar')
  await expect(page.locator('body')).toBeVisible()
})
