// Shared steps for the E2E tests
const { expect } = require('@playwright/test')

// A new email for every test, so tests never clash with each other
function uniqueEmail(label) {
  return `${label}-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`
}

// Signs up through the Register page, then logs in through the Login page
async function signUpAndLogIn(page, { name = 'Ananya', email, password = 'party2026' }) {
  await page.goto('/register')
  await page.getByLabel('Name (optional)').fill(name)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  // The login page fills in the email
  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

// Creates an event from the dashboard and waits for its event page
async function createEvent(page, { name, location = '' }) {
  await page.getByRole('button', { name: 'New event', exact: true }).click()
  await page.getByLabel('Event name').fill(name)
  if (location) await page.getByLabel('Location').fill(location)
  await page.getByRole('button', { name: 'Create event' }).click()
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
}

module.exports = { uniqueEmail, signUpAndLogIn, createEvent }