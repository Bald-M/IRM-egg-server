'use strict';
const { Service } = require('egg');
class UserService extends Service {
  // Add User Method
  async addUser(user) {
    console.log('-----------------addUser-----------------');
    user.register_time = new Date();
    // Execute insert sql to the database
    const users = await this.app.model.User.create(user);
    return users;
  }
}

module.exports = UserService;
