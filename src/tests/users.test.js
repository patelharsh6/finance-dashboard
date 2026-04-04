const request = require('supertest')
const app = require('../app')

const registerAndLogin = async (role) => {
  const email = `${role}@test.com`
  const res = await request(app).post('/api/auth/register').send({
    name: role,
    email,
    password: 'password123',
    role
  })
  return { token: res.body.token, userId: res.body.user.id }
}

describe('User management (admin only)', () => {
  it('admin can list all users', async () => {
    const { token } = await registerAndLogin('admin')
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.users).toBeDefined()
  })

  it('viewer is blocked from user list', async () => {
    const { token } = await registerAndLogin('viewer')
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(403)
  })

  it('admin can change a user role', async () => {
    const { token: adminToken } = await registerAndLogin('admin')
    const { userId } = await registerAndLogin('viewer')
    const res = await request(app)
      .patch(`/api/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'analyst' })
    expect(res.statusCode).toBe(200)
    expect(res.body.user.role).toBe('analyst')
  })

  it('rejects invalid role value', async () => {
    const { token: adminToken } = await registerAndLogin('admin')
    const { userId } = await registerAndLogin('viewer')
    const res = await request(app)
      .patch(`/api/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'superadmin' })
    expect(res.statusCode).toBe(400)
  })
})