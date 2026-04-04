require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')

const app = express()


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

  // mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' })
  }

  // mongoose duplicate key (eg. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({ message: `${field} already in use` })
  }

  // mongoose validation errors (schema level)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ message: messages[0] })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong'
  })
})

const PORT = process.env.PORT || 5000

// only start listening if this file is run directly, not when imported in tests
if (require.main === module) {
  connectDB()
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

module.exports = app