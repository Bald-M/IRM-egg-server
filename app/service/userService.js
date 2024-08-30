'use strict';
const { Service } = require('egg');
class UserService extends Service {
  // Add User Method
  async addUser(user) {
    console.log('-----------------addUser-----------------');
    // console.log(user);
    user.registered_date = new Date();
    console.log(user);

    // Execute insert sql to the database
    const users = await this.app.model.User.create(user);
    return users;
  }
}

module.exports = UserService;

// user
// -----------------addUser-----------------
// {
//   email: '1@student.wintec.ac.nz',
//   password: '12345678xA',
//   role: 'Student',
//   username: '1',
//   registered_date: 2024-08-30T13:29:45.742Z
// }
