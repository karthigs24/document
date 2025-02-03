const prisma = require('../config/prisma'); // Import Prisma client

/**
 * Create a new user
 * @param {Object} data - User data
 * @returns {Object} - Created user
 */
async function createUser(data) {
  const user = await prisma.user.create({
    data
  });
  return user;
}

/**
 * Find a user by username
 * @param {string} username - Username to find
 * @returns {Object|null} - Found user or null if not found
 */
async function findUserByUsername(username) {
  const user = await prisma.user.findUnique({
    where: { username }
  });
  return user;
}

/**
 * Find a user by Google ID
 * @param {string} googleId - Google ID to find
 * @returns {Object|null} - Found user or null if not found
 */
async function findUserByGoogleId(googleId) {
  const user = await prisma.user.findUnique({
    where: { googleId }
  });
  return user;
}

/**
 * Update a user's password
 * @param {string} userId - User ID
 * @param {string} password - New password
 * @returns {Object} - Updated user
 */
async function updateUserPassword(userId, password) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { password }
  });
  return user;
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserByGoogleId,
  updateUserPassword
};
