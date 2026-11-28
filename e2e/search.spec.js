// E2E: searching events from the dashboard (Ananya)
const { test, expect } = require('@playwright/test')
const { uniqueEmail, signUpAndLogIn, createEvent } = require('./helpers')

test('the dashboard search bar filters events as you type', async ({ page }) => {
  await signUpAndLogIn(page, { email: uniqueEmail('search') })
  for (const event of [
    { name: 'Spring Gala', location: 'Ackerman' },
    { name: 'Hackathon', location: 'Boelter Hall' },
  ]) {
    await createEvent(page, event)
    await page.getByRole('link', { name: 'All events' }).click()
  }

  const eventNames = page.locator('.ticket h2')
  await expect(eventNames).toHaveCount(2)

  // Matches the location, not just the name
  await page.getByLabel('Search your events').fill('boelter')
  await expect(eventNames).toHaveText(['Hackathon'])
  await expect(page.getByText('1 event matches "boelter".')).toBeVisible()

  await page.getByLabel('Search your events').fill('wedding')
  await expect(eventNames).toHaveCount(0)
  await expect(page.getByText('0 events match "wedding".')).toBeVisible()

  // Clearing the search shows everything again
  await page.getByLabel('Search your events').fill('')
  await expect(eventNames).toHaveCount(2)
})