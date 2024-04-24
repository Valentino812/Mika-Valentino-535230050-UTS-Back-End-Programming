const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @param {integer} page_number
 * @param {integer} page_size
 * @param {string} sort
 * @param {string} search
 * @returns {Array}
 */
async function getUsers(page_number, page_size, sort, search) {
  // Getting search field search and search key from search
  const [fieldSearch, searchKey] = search
    ? search.split(':')
    : [undefined, undefined];

  // Getting sort field order and sort order from order
  const [fieldOrder, sortOrder] = sort ? sort.split(':') : ['email', 'asc'];

  // Getting users data array with specific criteria (search/filter and order)
  const users = await usersRepository.getUsersSpecific(
    fieldSearch,
    searchKey,
    fieldOrder,
    sortOrder
  );

  // Set page_size to the number of all users data if not provided
  if (!page_size) {
    page_size = users.length;
  }

  // Pagination with page number and page size

  // Total of the pages
  // (the result of the division will be rounded up)
  const totalPages = Math.ceil(users.length / page_size);

  // Default start index and end index of the users array
  // without pagination (without page_number)
  let start = 0;
  let end = users.length;

  if (page_number) {
    start = (page_number - 1) * page_size;
    // (Math.min is used to make sure that the final index
    //  will not be more than the users array length)
    end = Math.min(start + page_size, users.length);
  }

  // Slicing the users array
  const paginatedUsers = users.slice(start, end);

  // Final users data array
  const usersResults = [];
  for (let i = 0; i < paginatedUsers.length; i += 1) {
    const user = paginatedUsers[i];
    usersResults.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  let results = {
    page_size,
    count: paginatedUsers.length,
    totalPages,
    has_previous_page: false,
    has_next_page: false,
    data: usersResults,
  };

  // Adding page_number to results if exists
  if (page_number) {
    results = {
      page_number,
      page_size,
      count: paginatedUsers.length,
      totalPages,
      has_previous_page: page_number > 1,
      has_next_page: page_number < totalPages,
      data: usersResults,
    };
  }

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
