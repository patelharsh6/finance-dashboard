const request = require('supertest')
const app = require('../app')

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
}

describe('Auth endpoints', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser)
    expect(res.statusCode).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.role).toBe('viewer')
  })

  it('blocks duplicate email on register', async () => {
    await request(app).post('/api/auth/register').send(testUser)
    const res = await request(app).post('/api/auth/register').send(testUser)
    expect(res.statusCode).toBe(409)
  })

  it('rejects register with missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' })
    expect(res.statusCode).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser)
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    })
    expect(res.statusCode).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it('rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser)
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongone'
    })
    expect(res.statusCode).toBe(401)
  })

  it('returns current user on GET /me', async () => {
    const reg = await request(app).post('/api/auth/register').send(testUser)
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.email).toBe(testUser.email)
  })

  it('blocks unauthenticated access to /me', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.statusCode).toBe(401)
  })
})