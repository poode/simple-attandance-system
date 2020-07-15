const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const signToken = user => jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRY,
});

/**
 *
 *
 * @param {string} token
 * @returns {Promise<{ user: { id: number, username: string, createdAt: Date, updatedAt: Date}}>}
 */
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      }
      const {
        user
      } = decoded;
  
      if (!user) {
        reject(new Error('invalid token'));
      }
    
      resolve(decoded);
    });
  });
}

const hashPassword = async password => {
  if (!password) {
    throw new Error('Password was not provided');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

const verifyPassword = async (candidate, actual) => {
  const result = await bcrypt.compare(candidate, actual);
  return result;
}

module.exports = { signToken, hashPassword, verifyPassword, verifyToken };
