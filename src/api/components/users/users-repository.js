const { User } = require('../../../models');
const { name } = require('../../../models/users-schema');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get a list of users with specific criteria
 * @param {string} fieldSearch
 * @param {string} searchKey
 * @param {string} fieldOrder
 * @param {string} sortOrder
 * @returns {Promise}
 */
async function getUsersSpecific(fieldSearch, searchKey, fieldOrder, sortOrder) {
  let users = []; // new array containing users information

  // Filtering users based on the search criteria
  if (fieldSearch && searchKey) {
    // Attempting case-insensitive (characters will be matched regardless of their case
    // (uppercase or lowercase)) pattern matching with search key in the field
    users = await User.find({
      [fieldSearch]: { $regex: searchKey, $options: 'i' },
    });
  } else {
    users = await User.find({});
  }

  // Ordering users based on the order criteria
  if (fieldOrder === 'email') {
    users.sort(
      (a, b) => a.email.localeCompare(b.email) * (sortOrder === 'asc' ? 1 : -1)
    );
  } else if (fieldOrder === 'name') {
    users.sort(
      (a, b) => a.name.localeCompare(b.name) * (sortOrder === 'asc' ? 1 : -1)
    );
  }

  return users;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUsersSpecific,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
};
