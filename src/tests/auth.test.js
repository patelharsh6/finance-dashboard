const request = require('supertest')
const app = require('../app')

// pull out a helper so we're not repeating register payload everywhere
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
}

describe('POST /api/auth/register', () => {
  it('should register a new user and return a token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser)

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user.email).toBe(testUser.email)
    expect(res.body.user.role).toBe('viewer') // default role
  })

  it('should not register with a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testUser)
    const res = await request(app).post('/api/auth/register').send(testUser)

    expect(res.statusCode).toBe(409)
    expect(res.body).toHaveProperty('message')
  })

  it('should reject registration with missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'test@example.com' })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('errors')
  })

  it('should reject a short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...testUser,
      password: '123'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.errors.password).toBeDefined()
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(testUser)
  })

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword'
    })

    expect(res.statusCode).toBe(401)
  })

  it('should reject non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123'
    })

    expect(res.statusCode).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  it('should return current user info', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(testUser)
    const token = registerRes.body.token

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.email).toBe(testUser.email)
  })

  it('should reject request with no token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.statusCode).toBe(401)
  })
})