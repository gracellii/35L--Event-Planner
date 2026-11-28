// Search: GET /api/events?q= (Ananya)
const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert/strict')
const { makeApp, resetDb, loggedInAgent, pool } = require('./helpers')

// Names of the events a search returns
async function searchNames(agent, q) {
  const res = await agent.get('/api/events').query({ q }).expect(200)
  return res.body.events.map((e) => e.name).sort()
}

describe('Search events', () => {
  let app, agent
  beforeEach(async () => {
    await resetDb()
    app = makeApp()
    agent = await loggedInAgent(app)
    await agent.post('/api/events').send({ name: 'Spring Gala', location: 'Ackerman Grand Ballroom' })
    await agent.post('/api/events').send({ name: 'Hackathon', location: 'Boelter Hall', description: 'Bring laptops' })
    await agent.post('/api/events').send({ name: 'Beach Day', description: 'Picnic at Santa Monica' })
  })
  after(() => pool.end())

  test('matches event names, ignoring case', async () => {
    assert.deepEqual(await searchNames(agent, 'gala'), ['Spring Gala'])
    assert.deepEqual(await searchNames(agent, 'HACK'), ['Hackathon'])
  })

  test('matches locations and descriptions too', async () => {
    assert.deepEqual(await searchNames(agent, 'boelter'), ['Hackathon'])
    assert.deepEqual(await searchNames(agent, 'santa monica'), ['Beach Day'])
  })

  test('an empty or blank search returns every event', async () => {
    assert.equal((await searchNames(agent, '')).length, 3)
    assert.equal((await searchNames(agent, '   ')).length, 3)
  })

  test('no matches returns an empty list', async () => {
    assert.deepEqual(await searchNames(agent, 'wedding'), [])
  })

  test('% and _ are searched literally, not as wildcards', async () => {
    assert.deepEqual(await searchNames(agent, '%'), [])
    assert.deepEqual(await searchNames(agent, '_'), [])
    await agent.post('/api/events').send({ name: '100% Fun Night' })
    assert.deepEqual(await searchNames(agent, '0%'), ['100% Fun Night'])
  })

  test("only searches the user's own events", async () => {
    const other = await loggedInAgent(app, 'other@example.com')
    await other.post('/api/events').send({ name: 'Secret Gala' })
    assert.deepEqual(await searchNames(agent, 'gala'), ['Spring Gala'])
    assert.deepEqual(await searchNames(other, 'gala'), ['Secret Gala'])
  })

  test('searches longer than 100 characters are rejected', async () => {
    const res = await agent.get('/api/events').query({ q: 'a'.repeat(101) }).expect(400)
    assert.match(res.body.message, /100 characters/)
  })
})