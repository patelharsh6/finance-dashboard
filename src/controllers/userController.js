const { getAllUsers, toggleUserActive, updateUserRole } = require('../services/userService')

const getUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers()
    res.status(200).json({ count: users.length, users })
  } catch (err) {
    next(err)
  }
}

const toggleActive = async (req, res, next) => {
  try {
    const user = await toggleUserActive(req.params.id, req.user._id.toString())
    res.status(200).json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user })
  } catch (err) {
    next(err)
  }
}

const changeRole = async (req, res, next) => {
  try {
    const user = await updateUserRole(req.params.id, req.user._id.toString(), req.body.role)
    res.status(200).json({ message: 'Role updated', user })
  } catch (err) {
    next(err)
  }
}

module.exports = { getUsers, toggleActive, changeRole }