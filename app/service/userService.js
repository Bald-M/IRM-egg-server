'use strict';
const { Service } = require('egg');
class UserService extends Service {
  // Add User Method
  async addUser(user) {
    console.log('-----------------addUser-----------------');
    // console.log(user);
    // Mysql autogenerate date
    // user.registered_date = new Date();
    user.username = user.email.split('@')[0];
    console.log(user);

    // Execute insert sql to the database
    // const users = await this.app.model.User.create(user);
    const users = await this.app.model.ApplicationUser.create(user);
    return users;
  }
  // Add User Verification Method
  async addVerification(app_user_id, server_ref, code, type) {
    console.log('-----------------addUserVerification-----------------');

    // Generate the current timestamp and expiration time
    const currentDate = new Date();
    // After 5 minutes
    const expirationDate = new Date(currentDate.getTime() + 5 * 60000);

    // Construct verification record
    const verificationData = {
      app_user_id,
      server_ref,
      code,
      type,
      expiration_date: expirationDate,
    };

    // Insert verification data into the User Verification table
    const verification = await this.app.model.UserVerification.create(verificationData);
    return verification;
  }
  async updateUserVerifications(app_user_id, updateData) {
    console.log('-----------------updateUserVerifications-----------------');
    // Generate the current timestamp and expiration time
    const currentDate = new Date();
    // After 5 minutes
    const expirationDate = new Date(currentDate.getTime() + 5 * 60000);
    // Check if a record with the given server_ref exists
    const verification = await this.app.model.UserVerification.findOne({
      where: { app_user_id: 11 },
    });
    if (!verification) {
      throw new Error('Verification record not found');
    }
    updateData.expiration_date = expirationDate;
    // Update the verification record with the provided updateData
    const updatedVerification = await verification.update(updateData);
    return updatedVerification;
  }
  // Find User Method
  async findUser(user) {
    console.log('-----------------findUser-----------------');
    console.log(user);
    // Find user on database
    const users = await this.app.model.ApplicationUser.findOne({
      where: {
        email: user.email,
        password: user.password,
      },
    });

    return users;
  }
  // Find User Verification
  async findUserVerification(user) {
    console.log('-----------------findUserVerification-----------------');
    console.log(user);
    // Find user on database
    const userVerifications = await this.app.model.UserVerification.findOne({
      where: {
        app_user_id: user.app_user_id,
      },
    });

    return userVerifications;
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

// users
// application_user {
//   dataValues: {
//     app_user_id: 3,
//     username: 'jasonb',
//     email: 'jasonb@student.wintec.ac.nz',
//     password: '12345678Abc',
//     type: 'Student',
//     status: 'Pending',
//     registered_date: 2024-09-11T01:23:29.000Z
//   },
//   _previousDataValues: {
//     app_user_id: 3,
//     username: 'jasonb',
//     email: 'jasonb@student.wintec.ac.nz',
//     password: '12345678Abc',
//     type: 'Student',
//     status: 'Pending',
//     registered_date: 2024-09-11T01:23:29.000Z
//   },
//   uniqno: 1,
//   _changed: Set(0) {},
//   _options: {
//     isNewRecord: false,
//     _schema: null,
//     _schemaDelimiter: '',
//     raw: true,
//     attributes: [
//       'app_user_id',
//       'username',
//       'email',
//       'password',
//       'type',
//       'status',
//       'registered_date'
//     ]
//   },
//   isNewRecord: false
// }
// application_user {
//   dataValues: {
//     app_user_id: 3,
//     username: 'jasonb',
//     email: 'jasonb@student.wintec.ac.nz',
//     password: '12345678Abc',
//     type: 'Student',
//     status: 'Pending',
//     registered_date: 2024-09-11T01:23:29.000Z
//   },
//   _previousDataValues: {
//     app_user_id: 3,
//     username: 'jasonb',
//     email: 'jasonb@student.wintec.ac.nz',
//     password: '12345678Abc',
//     type: 'Student',
//     status: 'Pending',
//     registered_date: 2024-09-11T01:23:29.000Z
//   },
//   uniqno: 1,
//   _changed: Set(0) {},
//   _options: {
//     isNewRecord: false,
//     _schema: null,
//     _schemaDelimiter: '',
//     raw: true,
//     attributes: [
//       'app_user_id',
//       'username',
//       'email',
//       'password',
//       'type',
//       'status',
//       'registered_date'
//     ]
//   },
//   isNewRecord: false
// }