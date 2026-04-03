const { validationResult } = require('express-validator')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // just send back the first error per field, not a wall of text
    const formatted = {}
    errors.array().forEach(err => {
      if (!formatted[err.path]) {
        formatted[err.path] = err.msg
      }
    })
    return res.status(400).json({ message: 'Validation failed', errors: formatted })
  }
  next()
}

module.exports = validate