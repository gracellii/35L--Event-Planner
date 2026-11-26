// Story 1 acceptance criteria (Ananya)
const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')
const { makeApp, resetDb, pool } = require('./helpers')

describe('Story 1: registration and login', () => {
  let app
  beforeEach(async () => {
    await resetDb()
    app = makeApp()
  })
  after(() => pool.end())

  test('AC1: valid email + password creates an account with a success message', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'Ana@Example.com', password: 'party2026', name: 'Ananya' })
      .expect(201)
    assert.match(res.body.message, /account created/i)
    assert.equal(res.body.user.email, 'ana@example.com')
    assert.equal(res.body.user.password_hash, undefined, 'never send the hash')
    const row = (await pool.query('SELECT password_hash FROM users')).rows[0]
    assert.notEqual(row.password_hash, 'party2026', 'password is hashed in the database')
  })

  test('AC2: duplicate email is rejected (any capitalisation) and no second account is made', async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@b.co', password: 'party2026' }).expect(201)
    const res = await request(app).post('/api/auth/register').send({ email: '  A@B.CO ', password: 'other2026' }).expect(409)
    assert.match(res.body.message, /already exists/i)
    assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n, 1)
    await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'party2026' }).expect(200)
  })

  test('AC3: invalid details return field errors and create nothing', async () => {
    const cases = [
      [{ email: '', password: '' }, ['email', 'password']],
      [{ email: 'not-an-email', password: 'party2026' }, ['email']],
      [{ email: 'a@b.co', password: 'short1' }, ['password']],
      [{ email: 'a@b.co', password: 'noNumbersHere' }, ['password']],
      [{ email: 'a@b.co', password: 'party2026', confirm: 'party2027' }, ['confirm']],
    ]
    for (const [body, fields] of cases) {
      const res = await request(app).post('/api/auth/register').send(body).expect(400)
      for (const f of fields) assert.ok(res.body.fields[f], `expected error for ${f} with ${JSON.stringify(body)}`)
    }
    assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n, 0)
  })

  test('AC4: correct credentials log in and give access to the dashboard data', async () => {
    const agent = request.agent(app)
    await agent.post('/api/auth/register').send({ email: 'a@b.co', password: 'party2026' })
    const res = await agent.post('/api/auth/login').send({ email: 'a@b.co', password: 'party2026' }).expect(200)
    assert.ok(res.headers['set-cookie'][0].includes('HttpOnly'))
    await agent.get('/api/auth/me').expect(200)
    await agent.get('/api/events').expect(200)
  })

  test('AC5: wrong email or password shows an error and blocks access', async () => {
    const agent = request.agent(app)
    await agent.post('/api/auth/register').send({ email: 'a@b.co', password: 'party2026' })
    const wrongPw = await agent.post('/api/auth/login').send({ email: 'a@b.co', password: 'wrong2026' }).expect(401)
    const wrongEmail = await agent.post('/api/auth/login').send({ email: 'x@b.co', password: 'party2026' }).expect(401)
    assert.equal(wrongPw.body.message, wrongEmail.body.message, 'same message for both')
    await agent.get('/api/events').expect(401)
  })

  test('AC6: logout ends the session; must log in again', async () => {
    const agent = request.agent(app)
    await agent.post('/api/auth/register').send({ email: 'a@b.co', password: 'party2026' })
    await agent.post('/api/auth/login').send({ email: 'a@b.co', password: 'party2026' })
    await agent.get('/api/events').expect(200)
    await agent.post('/api/auth/logout').expect(200)
    await agent.get('/api/events').expect(401)
    await agent.get('/api/auth/me').expect(401)
  })

  test('a forged session cookie is rejected', async () => {
    await request(app).get('/api/events').set('Cookie', 'ep_session=forged.token.here').expect(401)
  })
})
