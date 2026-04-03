const User = require('../models/User')

const getAllUsers = async () => {
  return User.find().select('-__v')
}

const toggleUserActive = async (targetId, requesterId) => {
  if (targetId === requesterId) {
    const err = new Error('You cannot deactivate your own account')
    err.status = 400
    throw err
  }

  const user = await User.findById(targetId)
  if (!user) {
    const err = new Error('User not found')
    err.status = 404
    throw err
  }

  user.isActive = !user.isActive
  await user.save()

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isActive: user.isActive
  }
}

const updateUserRole = async (targetId, requesterId, newRole) => {
  const validRoles = ['viewer', 'analyst', 'admin']
  if (!validRoles.includes(newRole)) {
    const err = new Error(`Role must be one of: ${validRoles.join(', ')}`)
    err.status = 400
    throw err
  }

  if (targetId === requesterId) {
    const err = new Error('You cannot change your own role')
    err.status = 400
    throw err
  }

  const user = await User.findByIdAndUpdate(
    targetId,
    { role: newRole },
    { new: true, runValidators: true }
  ).select('-__v')

  if (!user) {
    const err = new Error('User not found')
    err.status = 404
    throw err
  }

  return user
}

module.exports = { getAllUsers, toggleUserActive, updateUserRole }