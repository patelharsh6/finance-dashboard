const request = require('supertest')
const app = require('../app')

// helper to register and get token back
const loginAs = async (role = 'viewer') => {
  const email = `${role}@example.com`
  await request(app).post('/api/auth/register').send({
    name: role,
    email,
    password: 'password123',
    role
  })
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' })
  return res.body.token
}

const sampleTransaction = {
  amount: 5000,
  type: 'income',
  category: 'salary',
  date: '2024-01-15',
  notes: 'January salary'
}

describe('GET /api/transactions', () => {
  it('viewer can read transactions', async () => {
    const token = await loginAs('viewer')
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('transactions')
  })
})

describe('POST /api/transactions', () => {
  it('analyst can create a transaction', async () => {
    const token = await loginAs('analyst')
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleTransaction)

    expect(res.statusCode).toBe(201)
    expect(res.body.amount).toBe(5000)
    expect(res.body.category).toBe('salary')
  })

  it('viewer cannot create a transaction', async () => {
    const token = await loginAs('viewer')
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleTransaction)

    expect(res.statusCode).toBe(403)
  })

  it('should reject invalid transaction type', async () => {
    const token = await loginAs('analyst')
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...sampleTransaction, type: 'donation' }) // not a valid type

    expect(res.statusCode).toBe(400)
    expect(res.body.errors.type).toBeDefined()
  })

  it('should reject negative amount', async () => {
    const token = await loginAs('analyst')
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...sampleTransaction, amount: -100 })

    expect(res.statusCode).toBe(400)
  })
})

describe('DELETE /api/transactions/:id', () => {
  it('admin can soft delete a transaction', async () => {
    const analystToken = await loginAs('analyst')
    const adminToken = await loginAs('admin')

    // analyst creates it
    const created = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(sampleTransaction)

    const txId = created.body._id

    // admin deletes it
    const deleteRes = await request(app)
      .delete(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(deleteRes.statusCode).toBe(200)

    // should no longer show up in list
    const listRes = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${adminToken}`)

    const found = listRes.body.transactions.find(t => t._id === txId)
    expect(found).toBeUndefined()
  })

  it('analyst cannot delete a transaction', async () => {
    const analystToken = await loginAs('analyst')

    const created = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(sampleTransaction)

    const res = await request(app)
      .delete(`/api/transactions/${created.body._id}`)
      .set('Authorization', `Bearer ${analystToken}`)

    expect(res.statusCode).toBe(403)
  })
})