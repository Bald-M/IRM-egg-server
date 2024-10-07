'use strict';

const Controller = require('egg').Controller;
const { validatePassword } = require('../utils/passwordValidation');
const { validateEmail } = require('../utils/emailValidation');
const { generateVerificationCode } = require('../utils/generationVerificationCode');
const uuid = require('uuid');

class LoginController extends Controller {
  // Registration
  // Email Length <= 80
  async register() {
    const { ctx } = this;
    // Get parameters from frontend
    ctx.body = ctx.request.body;
    ctx.body.type = ctx.body.type.toLowerCase();
    const email = ctx.body.email;
    const password = ctx.body.password;
    const type = ctx.body.type;
    console.log(ctx.body);
    let returnMap = {};

    const server_ref = uuid.v4();
    try {
      // When email, password or type is empty string
      if (email === '' || password === '' || type === '') {
        throw new Error('Registration Verification Error', { cause: 'Email, Password or User role is empty' });
      }

      if (email.length > 80) {
        throw new Error('Registration Verification Error', { cause: 'Your email address length is not legal' });
      }

      // When frontend post non email type
      const emailError = validateEmail(email);
      if (!emailError) {
        throw new Error('Registration Verification Error', { cause: 'Invalid email address' });
      }

      // Ensure that students do not mistakenly select "industry" as their type
      if (!email.endsWith('@student.wintec.ac.nz') && type === 'student') {
        throw new Error('Registration Verification Error', { cause: 'The type selected is student, but your email is not associated with Wintec students. Please check that you have selected the correct type' });
      } else if (ctx.body.email.endsWith('@student.wintec.ac.nz') && ctx.body.type !== 'student') {
        throw new Error('Registration Verification Error', { cause: 'The type selected is industry, but your email is associated with Wintec students. Please check that you have selected the correct type' });
      }

      // If password doesn not meet the requirement
      // Lowercase + Uppercase letters + numbers, min 8 digits
      const passwordError = validatePassword(ctx.body.password);
      if (!passwordError) {
        throw new Error('Registration Verification Error', { error: 'Password must include uppercase, lowercase letters, and numbers and must be at least 8 digits' });
      }

      // Call addUser method from userService
      const users = await this.ctx.service.userService.addUser(ctx.body);

      // Generate verification code / OTP
      const OTP = generateVerificationCode(6);
      const userVerification = {
        app_user_id: users.app_user_id,
        server_ref,
        code: OTP,
      };
      await this.ctx.service.userService.addUserVerification(userVerification);
      await this.ctx.service.emailService.sendOTP(server_ref);
      ctx.status = 200;
      returnMap = { server_ref, description: 'Registration successful and OTP sent' };
    } catch (error) {
      console.log(error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        ctx.status = 409;
        returnMap = { error: 'Email already registered, Please use another email or Sign In' };
      } else if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }

      switch (error.cause) {
        case 'Email, Password or User role is empty':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'Invalid email address':
          ctx.status = 404;
          returnMap = { error: error.cause };
          break;
        case 'Your email address length is not legal':
          ctx.status = 403;
          returnMap = { error: error.cause };
          break;
        case 'The type selected is student, but your email is not associated with Wintec students. Please check that you have selected the correct type':
          ctx.status = 403;
          returnMap = { error: error.cause };
          break;
        case 'The type selected is industry, but your email is associated with Wintec students. Please check that you have selected the correct type':
          ctx.status = 403;
          returnMap = { error: error.cause };
          break;
        case 'Password must include uppercase, lowercase letters, and numbers and must be at least 8 digits':
          ctx.status = 403;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }

      // else if (error.name === 'SequelizeDatabaseError') {
      //   ctx.status = 400;
      //   returnMap = { error: 'Data truncated for column \'type\'' };
      // }
    }
    ctx.body = returnMap;
  }
  async login() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    // Create a jason instance for parsing to frontend
    const email = ctx.body.email;
    const password = ctx.body.password;
    let returnMap = {};
    console.log(ctx.body);


    try {
      if (password === '' || email === '') {
        throw new Error('Login Verification Error', { cause: 'Please provide email or password' });
      }

      const users = await this.ctx.service.userService.findUser(ctx.body);
      console.log(users);

      if (users === null) {
        throw new Error('Login Verification Error', { cause: 'Invalid username or password' });
      }

      // Check if the user is blocked, removed or pending
      if (users.status === 0) {
        throw new Error('Login Verification Error', { cause: 'Sorry, account need to be actived' });
      } else if (users.status === 2 || users.status === 3) {
        throw new Error('Login Verification Error', { cause: 'Sorry, account terminated or temporarily blocked' });
      }

      const token = ctx.app.jwt.sign({
        id: users.app_user_id,
        email: users.email,
        type: users.type,
      }, ctx.app.config.jwt.secret, {
        // 1m = 60000 ms
        // 1h = 1 hour
        expiresIn: '3h',
      });

      // Insert token to authentication_user table
      const token_row = {
        app_user_id: users.app_user_id,
        token,
      };
      await this.app.model.AuthenticationToken.upsert(token_row);

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
      console.log(error);

      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }

      switch (error.cause) {
        case 'Please provide email or password':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'Invalid username or password':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Sorry, account need to be actived':
          ctx.status = 403;
          {
            const users = await this.ctx.service.userService.findUser(ctx.body);
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
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
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
      const userVerifications = await this.ctx.service.userService.findUserVerification(ctx.body);
      console.log(userVerifications);

      if (OTP === '' || server_ref === '') {
        throw new Error('Email Verification Error', { cause: 'server_ref or OTP is empty' });
      }
      if (!userVerifications) {
        throw new Error('Email Verification Error', { cause: 'Invalid Server Ref. Please try again' });
      }
      if (userVerifications.code !== OTP) {
        throw new Error('Email Verification Error', { cause: 'Invalid OTP. Please try again' });
      }

      // Check if OTP is expired or not
      const currentTime = new Date();
      if (userVerifications.expiration_date < currentTime) {
        throw new Error('Email Verification Error', { cause: 'OTP expired' });
      }

      // If pass, update user verification & application user status
      // status: 1 - Active
      const updatedData = {
        status: 1,
        updated_date: new Date(),
      };
      await userVerifications.update(updatedData);
      await this.ctx.service.userService.updateUser(userVerifications.app_user_id, { status: 1 });
      ctx.status = 200;
      returnMap = { description: 'Email verification successful. Please Sign In' };
    } catch (error) {
      console.log(error);

      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }

      switch (error.cause) {
        case 'server_ref or OTP is empty':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'Invalid server_ref. Please try again':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. Please try again':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. OTP has expired':
          ctx.status = 410;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }
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
      const userVerifications = await this.ctx.service.userService.findUserVerification(ctx.body);
      // console.log(ctx.body);
      console.log(userVerifications);

      if (!userVerifications) {
        throw new Error('Send OTP Error', { cause: 'Invalid Server Ref' });
      }

      // Update OTP & Expiration
      const OTP = generateVerificationCode(6);
      const currentDate = new Date();
      // After 30 minutes
      const expirationDate = new Date(currentDate.getTime() + 30 * 60000);
      // update server ref as well
      const updateData = {
        code: OTP,
        expiration_date: expirationDate,
      };
      await userVerifications.update(updateData);
      await this.ctx.service.emailService.sendOTP(server_ref);
      ctx.status = 200;
      returnMap = { description: 'OTP Sent Successfully' };
    } catch (error) {
      console.log(error);

      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }

      switch (error.cause) {
        case 'Invalid Server Ref':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }
    }
    ctx.body = returnMap;
  }
  async forgotPasswordRequest() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    const email = ctx.body.email;
    let returnMap = {};
    try {
      if (email === '') {
        throw new Error('Forgot Password Verification Error', { cause: 'Please provide email' });
      }

      const emailError = validateEmail(email);

      if (!emailError) {
        throw new Error('Forgot Password Verification Error', { cause: 'Please provide valid email address' });
      }

      const users = await this.ctx.service.userService.findUser(ctx.body);

      if (!users) {
        throw new Error('Forgot Password Verification Error', { cause: 'Email is not registered' });
      }

      const userVerifications = await this.app.model.UserVerification.findOne({
        where: {
          app_user_id: users.app_user_id,
        },
      });

      // Update OTP & Expiration
      const OTP = generateVerificationCode(6);
      const currentDate = new Date();
      // After 30 minutes
      const expirationDate = new Date(currentDate.getTime() + 30 * 60000);
      // update server ref as well
      const updateData = {
        code: OTP,
        expiration_date: expirationDate,
      };
      await userVerifications.update(updateData);
      await this.ctx.service.emailService.sendOTP(userVerifications.server_ref);
      ctx.status = 200;
      returnMap = { server_ref: userVerifications.server_ref, description: 'Password reset OTP sent' };
    } catch (error) {
      console.log(error);

      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }
      switch (error.cause) {
        case 'Please provide email':
          ctx.status = 404;
          returnMap = { error: error.cause };
          break;
        case 'Email is not registered':
          ctx.status = 404;
          returnMap = { error: error.cause };
          break;
        case 'Please provide valid email address':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }

    }
    ctx.body = returnMap;
  }
  async forgotPasswordVerify() {
    const { ctx } = this;

    ctx.body = ctx.request.body;
    console.log(ctx.body);
    const server_ref = ctx.body.server_ref;
    const otp = ctx.body.otp;
    const email = ctx.body.email;
    let returnMap = {};

    try {
      const userVerifications = await this.ctx.service.userService.findUserVerification(ctx.body);

      if (!userVerifications) {
        throw new Error('Forgot Password Verification Error', { cause: 'server_ref is invalid. It cannot match' });
      }

      if (otp === '' || server_ref === '' || email === '') {
        throw new Error('Forgot Password Verification Error', { cause: 'server_ref, email or OTP is empty' });
      }

      // Check if OTP is expired or not
      const currentTime = new Date();
      if (userVerifications.expiration_date < currentTime) {
        throw new Error('Forgot Password Verification Error', { cause: 'Invalid OTP. OTP has expired' });
      }

      if (otp === userVerifications.code) {
        ctx.body = 200;
        returnMap = { description: 'OTP Matched' };
      } else {
        throw new Error('Forgot Password Verification Error', { cause: 'Invalid OTP. Please try again' });
      }
    } catch (error) {
      console.log(error);
      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }
      switch (error.cause) {
        case 'server_ref, email or OTP is empty':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. Please try again':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. OTP has expired':
          ctx.status = 410;
          returnMap = { error: error.cause };
          break;
        case 'server_ref is invalid. It cannot match':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }
    }

    ctx.body = returnMap;
  }
  async forgotPasswordChange() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    console.log(ctx.body);
    let returnMap = {};
    const email = ctx.body.email;
    const otp = ctx.body.otp;
    const server_ref = ctx.body.server_ref;
    const password = ctx.body.password;
    try {

      if (email === '' || server_ref === '' || otp === '') {
        throw new Error('Forgot Password Verification Error', { cause: 'server_ref, email or OTP is empty' });
      }

      if (password === '') {
        throw new Error('Forgot Password Verification Error', { cause: 'Please provide password' });
      }

      const emailError = validateEmail(email);
      if (!emailError) {
        throw new Error('Forgot Password Verification Error', { cause: 'Please provide valid email address' });
      }

      const passwordError = validatePassword(password);
      if (!passwordError) {
        throw new Error('Forgot Password Verification Error', { cause: 'Password must include uppercase, lowercase letters, and numbers and must be at least 8 digits' });
      }

      const users = await this.app.model.ApplicationUser.findOne({
        where: {
          email,
        },
      });

      console.log(users);
      if (!users) {
        throw new Error('Forgot Password Verification Error', { cause: 'Email address did not match' });
      }

      const userVerifications = await this.app.model.UserVerification.findOne({
        where: {
          server_ref,
        },
      });

      console.log(userVerifications);
      if (!userVerifications) {
        throw new Error('Forgot Password Verification Error', { cause: 'Invalid server_ref. Please try again' });
      }

      // Check if OTP is expired or not
      const currentTime = new Date();
      if (userVerifications.expiration_date < currentTime) {
        throw new Error('Forgot Password Verification Error', { cause: 'Invalid OTP. OTP has expired' });
      }

      if (otp !== userVerifications.code) {
        throw new Error('Forgot Password Verification Error', { error: 'Invalid OTP. Please try again' });
      }

      // Update Password
      const updateData = {
        password,
      };

      await users.update(updateData);
      ctx.status = 200;
      returnMap = { description: 'Password changing successful. Please Sign In' };

    } catch (error) {
      console.log(error);
      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }
      switch (error.cause) {
        case 'server_ref, email or OTP is empty':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'Email address did not match':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Please provide password':
          ctx.status = 404;
          returnMap = { error: error.cause };
          break;
        case 'Please provide valid email address':
          ctx.status = 404;
          returnMap = { error: error.cause };
          break;
        case 'Password must include uppercase, lowercase letters, and numbers and must be at least 8 digits':
          ctx.status = 403;
          returnMap = { error: error.cause };
          break;
        case 'Invalid server_ref. Please try again':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. OTP has expired':
          ctx.status = 410;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. Please try again':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }
    }
    ctx.body = returnMap;
  }
}

module.exports = LoginController;

