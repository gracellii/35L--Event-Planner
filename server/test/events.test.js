// Story 2 acceptance criteria (Ananya)
const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')
const { makeApp, resetDb, loggedInAgent, pool } = require('./helpers')

describe('Story 2: event workspace creation', () => {
  let app
  beforeEach(async () => {
    await resetDb()
    app = makeApp()
  })
  after(() => pool.end())

  test('AC1: a valid event name creates the event with that name, and the creator is host', async () => {
    const agent = await loggedInAgent(app)
    const res = await agent
      .post('/api/events')
      .send({ name: '  Spring Gala  ', date: '2027-04-17', startTime: '19:00', endTime: '23:00', location: 'Ackerman' })
      .expect(201)
    const ev = res.body.event
    assert.equal(ev.name, 'Spring Gala')
    assert.equal(ev.date, '2027-04-17', 'date never shifts by time zone')
    assert.equal(ev.startTime, '19:00')
    assert.equal(ev.endTime, '23:00')
    assert.equal(ev.location, 'Ackerman')
    assert.equal(ev.role, 'host')
    assert.equal((await agent.get('/api/events')).body.events.length, 1)
  })

  test('AC2: missing event name shows a validation message and creates nothing', async () => {
    const agent = await loggedInAgent(app)
    for (const body of [{}, { name: '' }, { name: '    ' }]) {
      const res = await agent.post('/api/events').send(body).expect(400)
      assert.match(res.body.fields.name, /required/i)
    }
    assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM events')).rows[0].n, 0)
  })

  test('AC3: opening one of several events shows only that event', async () => {
    const agent = await loggedInAgent(app)
    const a = (await agent.post('/api/events').send({ name: 'Birthday', location: 'Park' })).body.event
    const b = (await agent.post('/api/events').send({ name: 'Hackathon', location: 'Library' })).body.event
    const resA = (await agent.get(`/api/events/${a.id}`).expect(200)).body.event
    const resB = (await agent.get(`/api/events/${b.id}`).expect(200)).body.event
    assert.deepEqual([resA.name, resA.location], ['Birthday', 'Park'])
    assert.deepEqual([resB.name, resB.location], ['Hackathon', 'Library'])
  })

  test("users can't see or open each other's events", async () => {
    const alice = await loggedInAgent(app, 'alice@example.com')
    const bob = await loggedInAgent(app, 'bob@example.com')
    const ev = (await alice.post('/api/events').send({ name: 'Alice Party' })).body.event
    assert.equal((await bob.get('/api/events')).body.events.length, 0)
    await bob.get(`/api/events/${ev.id}`).expect(404)
    await bob.get('/api/events/not-a-number').expect(404)
  })

  test('Depends on Story 1: logged-out users cannot create or view events', async () => {
    await request(app).post('/api/events').send({ name: 'X' }).expect(401)
    await request(app).get('/api/events').expect(401)
  })

  test('bad dates and times are rejected on the right field', async () => {
    const agent = await loggedInAgent(app)
    const cases = [
      [{ name: 'X', date: '2027-02-30' }, 'date'],
      [{ name: 'X', date: 'next tuesday' }, 'date'],
      [{ name: 'X', date: '2027-04-17', startTime: '25:00' }, 'startTime'],
      [{ name: 'X', date: '2027-04-17', startTime: '19:00', endTime: '18:00' }, 'endTime'],
      [{ name: 'X', date: '2027-04-17', endTime: '18:00' }, 'startTime'],
      [{ name: 'X', startTime: '19:00' }, 'date'],
    ]
    for (const [body, field] of cases) {
      const res = await agent.post('/api/events').send(body).expect(400)
      assert.ok(res.body.fields[field], `expected ${field} error for ${JSON.stringify(body)}`)
    }
  })

  test('events are listed soonest first, undated last', async () => {
    const agent = await loggedInAgent(app)
    await agent.post('/api/events').send({ name: 'No date' })
    await agent.post('/api/events').send({ name: 'Later', date: '2027-05-01' })
    await agent.post('/api/events').send({ name: 'Sooner', date: '2027-03-06' })
    const names = (await agent.get('/api/events')).body.events.map((e) => e.name)
    assert.deepEqual(names, ['Sooner', 'Later', 'No date'])
  })
})
