const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // attach user to request object (excluding password)
    req.user = await User.findById(decoded.id)

    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' })
    }

    if (!req.user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated' })
    }

    next()
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' })
    }
    res.status(500).json({ message: 'Something went wrong' })
  }
}

module.exports = { protect }