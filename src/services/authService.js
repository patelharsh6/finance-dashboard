const jwt = require('jsonwebtoken')
const User = require('../models/User')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email })
  if (existing) {
    const err = new Error('Email already in use')
    err.status = 409
    throw err
  }

  const user = await User.create({ name, email, password, role })
  const token = generateToken(user._id)

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  }
}

const loginUser = async ({ email, password }) => {
  // explicitly select password since it's select:false in the model
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.matchPassword(password))) {
    const err = new Error('Invalid email or password')
    err.status = 401
    throw err
  }

  if (!user.isActive) {
    const err = new Error('Your account has been deactivated')
    err.status = 403
    throw err
  }

  const token = generateToken(user._id)

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  }
}

module.exports = { registerUser, loginUser }