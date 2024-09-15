// app/utils/generateVerificationCode.js

/**
 * Generate a random verification code.
 * @param {string} length - The length of the verification code.
 * @return {string} - The generated verification code.
 */
function generateVerificationCode(length) {
  const characters = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters[getRandomInt(characters.length)];
  }
  return code;
}

/**
 * Generate a random interger between 0 (inclusive) and max (exlusive).
 * @param {number} max - The upper bound (exclusive).
 * @return {number} - A random integer.
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

module.exports = {
  generateVerificationCode,
};

