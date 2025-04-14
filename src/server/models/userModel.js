const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const SALT_ROUNDS = 10;

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf8');
}

/**
 * Get all users from the database
 * @returns {Array} Array of user objects
 */
const getUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

/**
 * Save users to the database
 * @param {Array} users Array of user objects
 */
const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
};

/**
 * Find a user by their ID
 * @param {string} userId User ID to find
 * @returns {Object|null} User object or null if not found
 */
const findById = (userId) => {
  const users = getUsers();
  const user = users.find(user => user.id === userId);
  if (user) {
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

/**
 * Find a user by their username
 * @param {string} username Username to find
 * @returns {Object|null} User object or null if not found
 */
const findByUsername = (username) => {
  const users = getUsers();
  return users.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
};

/**
 * Create a new user
 * @param {Object} userData User data object containing username and password
 * @returns {Object} New user object without password
 */
const createUser = async ({ username, password }) => {
  const users = getUsers();

  // Check if username already exists
  if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Username already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create new user
  const newUser = {
    id: Date.now().toString(), // Simple ID generation
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  // Save to database
  users.push(newUser);
  saveUsers(users);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Verify user credentials
 * @param {string} username Username to verify
 * @param {string} password Password to verify
 * @returns {Object|null} User object without password if verified, null otherwise
 */
const verifyUser = async (username, password) => {
  const user = findByUsername(username);
  if (!user) return null;

  // Verify password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  findById,
  findByUsername,
  createUser,
  verifyUser,
  getUsers
};
