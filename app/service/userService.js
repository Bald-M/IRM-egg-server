'use strict';
const { Service } = require('egg');
class UserService extends Service {
  // Add User Method
  async addUser(user) {
    console.log('-----------------Add User-----------------');
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
  async updateUser(app_user_id, updateData) {
    console.log('-----------------Update User-----------------');
    const users = await this.app.model.ApplicationUser.findOne({
      where: {
        app_user_id,
      },
    });
    if (!users) {
      throw new Error('User record not found');
    }
    // Update application user record with the provided updateData
    const updatedUser = await users.update(updateData);
    return updatedUser;
  }
  async addStudent(student) {
    console.log('-----------------Add Student-----------------');
    const students = await this.app.model.Student.upsert(student);
    return students;
  }
  // Add User Verification Method
  async addUserVerification(userVerification) {
    console.log('-----------------addUserVerification-----------------');

    // Generate the current timestamp and expiration time
    const currentDate = new Date();
    // After 30 minutes
    const expirationDate = new Date(currentDate.getTime() + 30 * 60000);

    userVerification.expiration_date = expirationDate;
    // Insert verification data into the User Verification table
    const userVerifications = await this.app.model.UserVerification.create(userVerification);
    return userVerifications;
  }
  async updateUserVerifications(app_user_id, updateData) {
    console.log('-----------------updateUserVerifications-----------------');
    // Generate the current timestamp and expiration time
    const currentDate = new Date();
    // After 5 minutes
    const expirationDate = new Date(currentDate.getTime() + 5 * 60000);
    // Check if a record with the given server_ref exists
    const verification = await this.app.model.UserVerification.findOne({
      where: { app_user_id },
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
  // Valid email and password
  async findUser(user) {
    console.log('-----------------findUser-----------------');
    console.log(user);

    // Initialize an empty object for the 'where' clause
    const whereClause = {};

    // Dynamically add fields to the 'where' clause if they are present in the input
    if (user.id) {
      whereClause.app_user_id = user.id;
    }
    if (user.username) {
      whereClause.username = user.username;
    }
    if (user.email) {
      whereClause.email = user.email;
    }
    if (user.password) {
      whereClause.password = user.password;
    }
    if (user.type) {
      whereClause.type = user.type;
    }
    if (user.status) {
      whereClause.status = user.status;
    }
    if (user.registered_date) {
      whereClause.registered_date = user.registered_date;
    }

    // Query the database using the dynamically built where clause
    const users = await this.app.model.ApplicationUser.findOne({
      where: whereClause,
    });

    return users;
  }
  // Find User Verification
  async findUserVerification(userVerification) {
    console.log('-----------------findUserVerification-----------------');
    console.log(userVerification);
    // Find user verification on database
    // Dynamically build the `where` clause by including only the defined properties
    const whereClause = {};

    if (userVerification.verification_id) {
      whereClause.verification_id = userVerification.verification_id;
    }
    if (userVerification.app_user_id) {
      whereClause.app_user_id = userVerification.app_user_id;
    }
    if (userVerification.server_ref) {
      whereClause.server_ref = userVerification.server_ref;
    }
    if (userVerification.otp) {
      whereClause.code = userVerification.otp;
    }
    if (userVerification.type) {
      whereClause.type = userVerification.type;
    }
    if (userVerification.status) {
      whereClause.status = userVerification.status;
    }
    if (userVerification.expiration_date) {
      whereClause.expiration_date = userVerification.expiration_date;
    }
    if (userVerification.updated_date) {
      whereClause.updated_date = userVerification.updated_date;
    }

    // Find user verification in the database
    const userVerifications = await this.app.model.UserVerification.findOne({
      where: whereClause,
    });

    return userVerifications;
  }
}

module.exports = UserService;
