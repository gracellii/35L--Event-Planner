// E2E: Stories 1 and 2 through the real UI (Ananya)
const { test, expect } = require('@playwright/test')
const { uniqueEmail, signUpAndLogIn, createEvent } = require('./helpers')

test('a new user signs up, logs in, creates an event and opens it from the dashboard', async ({ page }) => {
  await signUpAndLogIn(page, { name: 'Ananya Rai', email: uniqueEmail('host') })
  await expect(page.getByRole('heading', { name: 'Hey Ananya.' })).toBeVisible()

  await createEvent(page, { name: 'Spring Gala', location: 'Ackerman Grand Ballroom' })
  await expect(page.getByText('Event created.')).toBeVisible()
  await expect(page.getByText('Ackerman Grand Ballroom')).toBeVisible()

  // Back on the dashboard, the event is listed and opens again
  await page.getByRole('link', { name: 'All events' }).click()
  await expect(page.getByText('1 event in the works.')).toBeVisible()
  await page.getByRole('link', { name: /Spring Gala/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Spring Gala' })).toBeVisible()
})

test('logging out ends the session, and logged-out users are sent to the login page', async ({ page }) => {
  await signUpAndLogIn(page, { email: uniqueEmail('logout') })

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/login$/)

  // Trying to open the dashboard directly goes back to login
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible()
})