// app/utils/validation.js

/**
 * Validate the password against specific criteria.
 * @param {string} password - The password to validate.
 * @returns {string|null} - Returns an error message if invalid, otherwise null.
 */
function validatePassword(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const minLength = 8;

  // Password must be at least 8 characters long.
  if (password.length < minLength) {
    return false;
  }
  // Password must include uppercase, lowercase letters, and numbers.
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return false;
  }
  return true; // Valid password
}

module.exports = {
  validatePassword,
};
