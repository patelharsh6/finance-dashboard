const request = require('supertest')
const app = require('../app')

const registerAndLogin = async (role) => {
  const email = `${role}_user@example.com`
  await request(app).post('/api/auth/register').send({
    name: `${role} user`,
    email,
    password: 'password123',
    role
  })
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' })
  return { token: res.body.token, userId: res.body.user.id }
}

describe('GET /api/users', () => {
  it('admin can list all users', async () => {
    const { token } = await registerAndLogin('admin')
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('users')
  })

  it('viewer gets blocked from user list', async () => {
    const { token } = await registerAndLogin('viewer')
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(403)
  })
})

describe('PATCH /api/users/:id/role', () => {
  it('admin can change another user role', async () => {
    const { token: adminToken } = await registerAndLogin('admin')
    const { userId: viewerId } = await registerAndLogin('viewer')

    const res = await request(app)
      .patch(`/api/users/${viewerId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'analyst' })

    expect(res.statusCode).toBe(200)
    expect(res.body.user.role).toBe('analyst')
  })

  it('should reject an invalid role value', async () => {
    const { token: adminToken } = await registerAndLogin('admin')
    const { userId: viewerId } = await registerAndLogin('viewer')

    const res = await request(app)
      .patch(`/api/users/${viewerId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'superuser' }) // doesn't exist

    expect(res.statusCode).toBe(400)
  })
})