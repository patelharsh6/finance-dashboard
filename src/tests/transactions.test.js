const request = require('supertest')
const app = require('../app')

// register a user with a given role and return their token
const getToken = async (role) => {
  const email = `${role}@test.com`
  const res = await request(app).post('/api/auth/register').send({
    name: role,
    email,
    password: 'password123',
    role
  })
  return res.body.token
}

const validTx = {
  amount: 5000,
  type: 'income',
  category: 'salary',
  date: '2024-03-01'
}

describe('Transaction access control', () => {
  it('viewer can read transactions', async () => {
    const token = await getToken('viewer')
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.transactions).toBeDefined()
  })

  it('viewer cannot create a transaction', async () => {
    const token = await getToken('viewer')
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(validTx)
    expect(res.statusCode).toBe(403)
  })

  it('analyst can create a transaction', async () => {
    const token = await getToken('analyst')
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(validTx)
    expect(res.statusCode).toBe(201)
    expect(res.body.amount).toBe(5000)
  })

  it('analyst cannot delete a transaction', async () => {
    const token = await getToken('analyst')
    const created = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(validTx)
    const res = await request(app)
      .delete(`/api/transactions/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(403)
  })

  it('admin can delete a transaction', async () => {
    const analystToken = await getToken('analyst')
    const adminToken = await getToken('admin')
    const created = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(validTx)
    const res = await request(app)
      .delete(`/api/transactions/${created.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.statusCode).toBe(200)
  })
})

describe('Transaction validation', () => {
  it('rejects invalid type', async () => {
    const token = await getToken('analyst')
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validTx, type: 'donation' })
    expect(res.statusCode).toBe(400)
    expect(res.body.errors.type).toBeDefined()
  })

  it('rejects negative amount', async () => {
    const token = await getToken('analyst')
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validTx, amount: -500 })
    expect(res.statusCode).toBe(400)
  })

  it('rejects request with no token', async () => {
    const res = await request(app).get('/api/transactions')
    expect(res.statusCode).toBe(401)
  })
})