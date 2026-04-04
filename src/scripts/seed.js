require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Transaction = require('../models/Transaction')

const connectDB = require('../config/db')

const users = [
  { name: 'Admin User', email: 'admin@demo.com', password: 'password123', role: 'admin' },
  { name: 'Analyst User', email: 'analyst@demo.com', password: 'password123', role: 'analyst' },
  { name: 'Viewer User', email: 'viewer@demo.com', password: 'password123', role: 'viewer' }
]

const categories = ['salary', 'rent', 'food', 'freelance', 'utilities', 'transport', 'healthcare', 'entertainment']

const randomAmount = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2))

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

const seed = async () => {
  try {
    await connectDB()

    // wipe existing data
    await User.deleteMany({})
    await Transaction.deleteMany({})
    console.log('Cleared existing data')

    // create users
    const createdUsers = await User.create(users)
    console.log(`Created ${createdUsers.length} users`)

    const adminUser = createdUsers.find(u => u.role === 'admin')

    // generate 40 transactions spread across the last 12 months
    const transactions = []
    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-12-31')

    for (let i = 0; i < 40; i++) {
      const type = i % 3 === 0 ? 'expense' : 'income' // roughly 2/3 income, 1/3 expense
      const category = categories[Math.floor(Math.random() * categories.length)]

      transactions.push({
        amount: type === 'income' ? randomAmount(3000, 15000) : randomAmount(500, 5000),
        type,
        category,
        date: randomDate(startDate, endDate),
        notes: `Seeded ${type} — ${category}`,
        createdBy: adminUser._id
      })
    }

    await Transaction.create(transactions)
    console.log(`Created ${transactions.length} transactions`)

    console.log('\nSeed complete. Test accounts:')
    console.log('  admin@demo.com   / password123  (admin)')
    console.log('  analyst@demo.com / password123  (analyst)')
    console.log('  viewer@demo.com  / password123  (viewer)')

    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err.message)
    process.exit(1)
  }
}

seed()