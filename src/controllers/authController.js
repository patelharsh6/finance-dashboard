const { registerUser, loginUser } = require('../services/authService')

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body
    const result = await registerUser({ name, email, password, role })
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await loginUser({ email, password })
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

const getMe = async (req, res) => {
  // req.user is already attached by protect middleware
  const { _id: id, name, email, role, isActive, createdAt } = req.user
  res.status(200).json({ id, name, email, role, isActive, createdAt })
}

module.exports = { register, login, getMe }