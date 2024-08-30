'use strict';

const Controller = require('egg').Controller;
const { validatePassword } = require('../utils/passwordValidation');
const { validateEmail } = require('../utils/emailValidation');

class LoginController extends Controller {
  // Registration
  async register() {
    const { ctx } = this;
    // Get parameters from frontend
    ctx.body = ctx.request.body;
    let returnMap = {};
    // Validate Email
    const emailError = validateEmail(ctx.body.email);
    if (!emailError) {
      returnMap = { code: 400, msg: 'Invalid email address' };
      ctx.body = returnMap;
      return;
    }
    // Validate Password
    // If password doesn not meet the requirement
    const passwordError = validatePassword(ctx.body.password);
    if (!passwordError) {
      returnMap = { code: 400, msg: 'Password must include uppercase, lowercase letters, and numbers and must be at least 8 digits' };
      ctx.body = returnMap;
      return;
    }
    try {
      // Call addUser method from userService
      const users = await this.ctx.service.userService.addUser(ctx.body);
      returnMap = { code: 200, msg: 'Successful Registration', data: users };
    } catch (error) {
      console.error(error);
      returnMap = { code: 409, msg: error.original.sqlMessage };
    }
    // Parse registration info to service, then write to the db
    ctx.body = returnMap;
  }
}

module.exports = LoginController;

// ctx.body
// {
//   email: '1@student.wintec.ac.nz',
//   password: '12345678xA',
//   role: 'Student',
//   username: '1'
// }
