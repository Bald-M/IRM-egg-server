'use strict';

const Controller = require('egg').Controller;
const { validatePassword } = require('../utils/passwordValidation');
const { validateEmail } = require('../utils/emailValidation');
const { generateVerificationCode } = require('../utils/generationVerificationCode');
const uuid = require('uuid');

class LoginController extends Controller {
  // Registration
  async register() {
    const { ctx } = this;
    // Get parameters from frontend
    ctx.body = ctx.request.body;
    ctx.body.type = ctx.body.type.toLowerCase();
    console.log(ctx.body);
    let returnMap = {};
    // Validate Email
    const emailError = validateEmail(ctx.body.email);
    // When frontend post non email type
    if (!emailError) {
      ctx.status = 400;
      returnMap = { error: 'Invalid email address' };
      ctx.body = returnMap;
      return;
    }
    // Ensure that students do not mistakenly select "industry" as their type
    if (!ctx.body.email.endsWith('@student.wintec.ac.nz') && ctx.body.type === 'student') {
      ctx.status = 400;
      returnMap = { error: 'The type selected is student, but your email is not associated with Wintec students. Please check that you have selected the correct type.' };
      ctx.body = returnMap;
      return;
    } else if (ctx.body.email.endsWith('@student.wintec.ac.nz') && ctx.body.type !== 'student') {
      ctx.status = 400;
      returnMap = { error: 'The type selected is industry, but your email is associated with Wintec students. Please check that you have selected the correct type.' };
      ctx.body = returnMap;
      return;
    }
    // Validate Password
    // If password doesn not meet the requirement
    // Lowercase + Uppercase letters + numbers, min 8 digits
    const passwordError = validatePassword(ctx.body.password);
    if (!passwordError) {
      ctx.status = 400;
      returnMap = { error: 'Password must include uppercase, lowercase letters, and numbers and must be at least 8 digits' };
      ctx.body = returnMap;
      return;
    }
    // serverRef: ebafbe85-1ac8-465f-be84-71414fb66d04
    const serverRef = uuid.v4();
    try {
      // Call addUser method from userService
      // Call addUser method from userService
      const users = await this.ctx.service.userService.addUser(ctx.body);

      // Generate verification code / OTP
      const OTP = generateVerificationCode(6);
      await this.ctx.service.userService.addVerification(users.app_user_id, serverRef, OTP);
      await this.ctx.service.emailService.sendOTP(serverRef);
      ctx.status = 200;
      returnMap = { server_ref: serverRef, description: 'Registration successful and OTP sent' };
    } catch (error) {
      console.log(error);

      // 409 Email already registered, Please use another email or Sign In
      if (error.name === 'SequelizeUniqueConstraintError') {
        ctx.status = 400;
        returnMap = { error: 'Email already registered, Please use another email or Sign In' };
      } else if (error.name === 'SequelizeDatabaseError') {
        ctx.status = 400;
        returnMap = { error: 'Data truncated for column \'type\'' };
      } else {
        ctx.status = 500;
        returnMap = { error: 'Internal Server Error' };
      }
      // returnMap = { code: 409, msg: error.original.sqlMessage };
    }
    ctx.body = returnMap;
  }
  async login() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    // Create a jason instance for parsing to frontend
    let returnMap = {};
    console.log(ctx.body);
    // Email Validation
    if (ctx.body.password === '' || ctx.body.email === '') {
      ctx.status = 400;
      returnMap = { error: 'Please provide email or password' };
      ctx.body = returnMap;
      return;
    }

    try {
      const users = await this.ctx.service.userService.findUser(ctx.body);
      console.log(users);

      if (users === null) {
        throw new Error('Login Error', { cause: 'Invalid username or password' });
      }

      // Check if the user is blocked, removed or pending
      if (users.status === 0) {
        throw new Error('Login Error', { cause: 'Sorry, account need to be actived' });
      } else if (users.status === 2 || users.status === 3) {
        throw new Error('Login Error', { cause: 'Sorry, account terminated or temporarily blocked' });
      }

      const token = ctx.app.jwt.sign({
        id: users.app_user_id,
        email: users.email,
        type: users.type,
      }, ctx.app.config.jwt.secret, {
        expiresIn: '1h',
      });
      ctx.status = 200;
      returnMap = {
        auth_key: token,
        profile_data: {
          name: users.username,
          email: users.email,
          app_uid: users.app_user_id,
          user_type: users.type,
        },
      };

    } catch (error) {
      // console.log(error);
      const users = await this.ctx.service.userService.findUser(ctx.body);
      console.log(users.app_user_id);
      // const userVerifications = await this.ctx.service.userService.findUserVerification(users);
      switch (error.cause) {
        case 'Invalid username or password':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'Sorry, account need to be actived':
          ctx.status = 400;
          {
            // Generate New OTP & Server Ref
            const OTP = generateVerificationCode(6);
            const serverRef = uuid.v4();
            console.log(serverRef);
            const updateData = {
              server_ref: serverRef,
              code: OTP,
            };
            await this.ctx.service.userService.updateUserVerifications(users.app_user_id, updateData);
            await this.ctx.service.emailService.sendOTP(serverRef);
            returnMap = { error: 'OTP sent, Email verification required', server_ref: serverRef };
          }
          break;
        case 'Sorry, account terminated or temporarily blocked':
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later.' };
          break;
      }
    }

    ctx.body = returnMap;
  }
  async emailVerification() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    console.log(ctx.body);
    const server_ref = ctx.body.server_ref;
    const OTP = ctx.body.otp;

    // Create a jason instance for parsing to frontend
    let returnMap = {};
    console.log(ctx.body);
    try {
      const userVerification = await this.app.model.UserVerification.findOne({
        where: {
          server_ref,
        },
      });
      // console.log(server_ref);
      // console.log(userVerification.server_ref);
      // console.log(userVerification.server_ref === server_ref);

      if (OTP === '' || server_ref === '') {
        throw new Error('Email Verification Error', { cause: 'server_ref or OTP is empty' });
      }
      if (!userVerification) {
        throw new Error('Email Verification Error', { cause: 'Invalid Server Ref. Please try again' });
      }
      if (userVerification.code !== OTP) {
        throw new Error('Email Verification Error', { cause: 'Invalid OTP. Please try again' });
      }

      // Check if OTP is expired or not
      const currentTime = new Date();
      if (userVerification.expiration_date < currentTime) {
        throw new Error('Email Verification Error', { cause: 'OTP expired' });
      }

      // If pass, update user verification & application user status
      // status: 1 - Active
      const updatedData = {
        status: 1,
        updated_date: new Date(),
      };
      await userVerification.update(updatedData);
      // await this.ctx.service.userService.updateUserVerifications(userVerification.app_user_id, updatedData);
      await this.ctx.service.userService.updateUser(userVerification.app_user_id, { status: 1 });
      ctx.status = 200;
      returnMap = { description: 'Email verification successful. Please Sign In' };
    } catch (error) {
      console.log(error);
      switch (error.cause) {
        case 'Invalid server_ref. Please try again':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. Please try again':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'OTP expired':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Internal Server Error' };
          break;
      }
      ctx.status = 400;
      returnMap = { error: error.cause };
    }

    ctx.body = returnMap;
  }
  // When user click on resend button, call this function
  async sendOTP() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    const server_ref = ctx.body.server_ref;
    let returnMap = {};
    try {
      // F
      const userVerifications = await this.app.model.UserVerification.findOne({
        where: {
          server_ref,
        },
      });

      if (!userVerifications) {
        ctx.status = 400;
        returnMap = { error: 'Invalid Server Ref' };
        ctx.body = returnMap;
        return;
      }

      // Update OTP & Expiration
      const OTP = generateVerificationCode(6);
      const currentDate = new Date();
      // After 5 minutes
      const expirationDate = new Date(currentDate.getTime() + 5 * 60000);
      const updateData = {
        code: OTP,
        expiration_date: expirationDate,
      };
      // await this.ctx.service.userService.updateUserVerifications(userVarifications.app_user_id, updateData);
      await userVerifications.update(updateData);
      await this.ctx.service.emailService.sendOTP(server_ref);
      ctx.status = 200;
      returnMap = { description: 'OTP Sent Successfully' };
    } catch (error) {
      console.log(error);
      ctx.status = 400;
      returnMap = { error: 'Email Sent Failure' };
    }
    ctx.body = returnMap;
  }
}

module.exports = LoginController;

// ctx.body
// {
//   email: 'jasonxd@qq.com',
//   password: '12345678Abc',
//   type: 'student',
//   username: 'jasonxd'
// }

// Error
// SequelizeUniqueConstraintError
// Duplicate entry 'jasonxd@qq.com' for key 'application_user.email'
// "error": {
//         "name": "SequelizeUniqueConstraintError",
//         "errors": [
//             {
//                 "message": "email must be unique",
//                 "type": "unique violation",
//                 "path": "email",
//                 "value": "jasonxd@qq.com",
//                 "origin": "DB",
//                 "instance": {
//                     "app_user_id": null,
//                     "email": "jasonxd@qq.com",
//                     "password": "12345678Abc",
//                     "type": "student",
//                     "username": "jasonxd"
//                 },
//                 "validatorKey": "not_unique",
//                 "validatorName": null,
//                 "validatorArgs": []
//             }
//         ],
//         "parent": {
//             "code": "ER_DUP_ENTRY",
//             "errno": 1062,
//             "sqlState": "23000",
//             "sqlMessage": "Duplicate entry 'jasonxd@qq.com' for key 'application_user.email'",
//             "sql": "INSERT INTO `application_user` (`app_user_id`,`username`,`email`,`password`,`type`) VALUES (DEFAULT,?,?,?,?);",
//             "parameters": [
//                 "jasonxd",
//                 "jasonxd@qq.com",
//                 "12345678Abc",
//                 "student"
//             ]
//         },
//         "original": {
//             "code": "ER_DUP_ENTRY",
//             "errno": 1062,
//             "sqlState": "23000",
//             "sqlMessage": "Duplicate entry 'jasonxd@qq.com' for key 'application_user.email'",
//             "sql": "INSERT INTO `application_user` (`app_user_id`,`username`,`email`,`password`,`type`) VALUES (DEFAULT,?,?,?,?);",
//             "parameters": [
//                 "jasonxd",
//                 "jasonxd@qq.com",
//                 "12345678Abc",
//                 "student"
//             ]
//         },
//         "fields": {
//             "email": "jasonxd@qq.com"
//         },
//         "sql": "INSERT INTO `application_user` (`app_user_id`,`username`,`email`,`password`,`type`) VALUES (DEFAULT,?,?,?,?);"
//     }

// SequelizeDatabaseError
// enum ('Student', 'Client', 'IRM User', 'Admin'), when user input users
// "error": {
//         "name": "SequelizeDatabaseError",
//         "parent": {
//             "code": "WARN_DATA_TRUNCATED",
//             "errno": 1265,
//             "sqlState": "01000",
//             "sqlMessage": "Data truncated for column 'type' at row 1",
//             "sql": "INSERT INTO `application_user` (`app_user_id`,`username`,`email`,`password`,`type`) VALUES (DEFAULT,?,?,?,?);",
//             "parameters": [
//                 "jasonxd",
//                 "jasonxd@qqs.com",
//                 "12345678Abc",
//                 "students"
//             ]
//         },
//         "original": {
//             "code": "WARN_DATA_TRUNCATED",
//             "errno": 1265,
//             "sqlState": "01000",
//             "sqlMessage": "Data truncated for column 'type' at row 1",
//             "sql": "INSERT INTO `application_user` (`app_user_id`,`username`,`email`,`password`,`type`) VALUES (DEFAULT,?,?,?,?);",
//             "parameters": [
//                 "jasonxd",
//                 "jasonxd@qqs.com",
//                 "12345678Abc",
//                 "students"
//             ]
//         },
//         "sql": "INSERT INTO `application_user` (`app_user_id`,`username`,`email`,`password`,`type`) VALUES (DEFAULT,?,?,?,?);",
//         "parameters": [
//             "jasonxd",
//             "jasonxd@qqs.com",
//             "12345678Abc",
//             "students"
//         ]
//     }
