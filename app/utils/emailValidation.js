// app/utils/validation.js

/**
 * Validate if the given email is in a valid format.
 * @param {string} email - The email to validate.
 * @returns {string|null} - Returns an error message if invalid, otherwise null.
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  return true; // Valid email
}

module.exports = {
  validateEmail,
};
