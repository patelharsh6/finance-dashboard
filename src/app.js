require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')

const app = express()

connectDB()

// basic rate limiting — 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, slow down' }
})

app.use(cors())
app.use(express.json())
app.use(limiter)

// routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/transactions', require('./routes/transactions'))
app.use('/api/dashboard', require('./routes/dashboard'))

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong'
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))