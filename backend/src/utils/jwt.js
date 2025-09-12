const jwt = require('jsonwebtoken')

const generateToken = payload => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

const verifyToken = token => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

const createTokenResponse = user => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    patientId: user.patientId
  }

  const token = generateToken(payload)

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      patientId: user.patientId,
      phone: user.phone,
      createdAt: user.createdAt
    }
  }
}

module.exports = {
  generateToken,
  verifyToken,
  createTokenResponse
}
