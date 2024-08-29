'use strict';

const Controller = require('egg').Controller;

class LoginController extends Controller {
  // Registration
  async register() {
    const { ctx } = this;
    // Get parameters from frontend
    ctx.body = ctx.request.body;
    let returnMap = {};
    try {
      // Call addUser method from userService
      const users = await this.ctx.service.userService.addUser(ctx.body);
      returnMap = { code: '200', msg: 'Successful Registration', data: users };
    } catch (error) {
      console.error(error);
      returnMap = { code: '409', msg: 'Registration Failure' };
    }
    // Parse registration info to service, then write to the db
    ctx.body = returnMap;
  }
}

module.exports = LoginController;
