// role hierarchy — higher index means more access
const roleLevel = {
  viewer: 1,
  analyst: 2,
  admin: 3
}

// use this when you want only specific roles
// eg. allowRoles('admin') or allowRoles('admin', 'analyst')
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This action requires one of these roles: ${roles.join(', ')}`
      })
    }
    next()
  }
}

// use this when you want minimum role level
// eg. requireLevel('analyst') means analyst and admin both get through
const requireLevel = (minRole) => {
  return (req, res, next) => {
    if (roleLevel[req.user.role] < roleLevel[minRole]) {
      return res.status(403).json({
        message: `Access denied. You need at least ${minRole} access to do this`
      })
    }
    next()
  }
}

module.exports = { allowRoles, requireLevel }