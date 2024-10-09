'use strict';

const Controller = require('egg').Controller;
const { validateEmail } = require('../utils/emailValidation')

class UserController extends Controller {
  async completeApplication() {
    const { ctx } = this;
    // Accept from frontend
    ctx.body = ctx.request.body;
    const student_email = ctx.request.body.student_email;
    const name = ctx.request.body.name;
    const wintec_id = ctx.request.body.wintec_id;
    const personal_email = ctx.request.body.personal_email;
    const phone_number = ctx.request.body.phone_number;
    const personal_statement = ctx.request.body.personal_statement;
    const cv_link = ctx.request.body.cv_link;
    const linkedin_link = ctx.request.body.linkedin_link;
    const portfolio_link = ctx.request.body.portfolio_link;
    const github_link = ctx.request.body.github_link;
    const average_grade = ctx.request.body.average_grade;
    const programme_of_study = ctx.request.body.programme_of_study;
    const area_of_study = ctx.request.body.area_of_study;
    const skills = ctx.request.body.skills;
    const favourite_courses = ctx.request.body.favourite_courses;
    const reference = ctx.request.body.references;
    const internship_options = ctx.request.body.internship_options;
    const preferred_companies = ctx.request.body.preferred_companies;
    const first_preference = ctx.request.body.first_preference;
    const second_preference = ctx.request.body.second_preference;
    let returnMap = {};
    const token = ctx.request.headers.authorization;
    const authToken = token.split(' ')[1];
    const decoded = ctx.app.jwt.verify(authToken, ctx.app.config.jwt.secret);
    const formFields = {
      student_email,
      name,
      wintec_id,
      personal_email,
      phone_number,
      personal_statement,
      cv_link,
      linkedin_link,
      portfolio_link,
      github_link,
      average_grade,
      programme_of_study,
      area_of_study,
      skills,
      favourite_courses,
      reference,
      internship_options,
      preferred_companies,
      first_preference,
      second_preference,
    };


    try {
      const emptyFields = Object.keys(formFields).filter(key => formFields[key] === '');

      if (emptyFields.length > 0) {
        throw new Error('Application Fields Validation Error', {
          cause: `The following fields are missing: ${emptyFields.join(', ')}`,
        });
      }

      if (decoded.type !== 'Student') {
        throw new Error('Complete Application Error', { cause: 'Authentication failed. Please try again' });
      }

      const studentEmailError = validateEmail(student_email);
      if (!studentEmailError) {
        throw new Error('Complete Application Error', { cause: 'Student email address is not an email format' });
      }

      const personalEmailError = validateEmail(personal_email);
      if (!personalEmailError) {
        throw new Error('Complete Application Error', { cause: 'Personal email address is not an email format' });
      }

      const student = {
        app_user_id: decoded.id,
        name,
        wintec_id,
        personal_email,
        student_email,
        phone_number,
        personal_statement,
        cv_link,
        linkedin_link,
        portfolio_link,
        github_link,
        average_grade,
        programme_of_study,
        area_of_study,
        skills,
        favourite_courses,
        reference,
        internship_options: JSON.stringify(internship_options),
        preferred_companies: JSON.stringify(preferred_companies),
        first_preference,
        second_preference,
      };
      await this.ctx.service.userService.addStudent(student);
      ctx.status = 200;
      returnMap = { description: 'Application saved' };
    } catch (error) {
      console.log(error);
      if (error.message === 'Application Fields Validation Error') {
        ctx.status = 401;
        returnMap = { error: error.cause };
      }
      switch (error.cause) {
        case 'Student email address is not an email format':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Personal email address is not an email format':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Authentication failed. Please try again':
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
  async getStudentProfileData() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    const user_id = ctx.body.user_id;
    let returnMap = {};

    try {
      if (user_id === '') {
        throw new Error('Get Student Profile Data Error', { cause: 'Please provide user id' });
      }

      const student = await this.app.model.Student.findOne({
        where: { app_user_id: user_id },
      });

      if (!student) {
        throw new Error('Get Student Profile Data Error', { cause: 'User is not exist' });
      }

      console.log(student);
      ctx.status = 200;
      returnMap = { student };

    } catch (error) {
      console.log(error);
      switch (error.cause) {
        case 'Please provide user id':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'User is not exist':
          ctx.status = 404;
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

module.exports = UserController;

// {
//   name: 'zihan',
//   id: '18470661',
//   personalEmail: '11@qq.com',
//   studentEmail: '11@qq.com',
//   phoneNum: '123456',
//   personalStatement: 'adads',
//   cv: 'asdad',
//   linkedin: 'asdasd',
//   portfolio: 'adadadf',
//   github: 'afafafa',
//   grade: 'A grade',
//   programme: 'Postgraduate Diploma in IT',
//   areaOfStudy: 'Networking Engineering',
//   experience: 'asfaf',
//   courses: 'asfasf',
//   tutors: 'afafff',
//   internshipOptions: [
//     'API Development',
//     'Data Analysis',
//     'Mobile App Development',
//     'Networking'
//   ],
//   preferences: [
//     'Blackout Games',
//     'Mobile App Development',
//     'Networking',
//     'System support - help desk'
//   ],
//   firstPreference: 'Internship',
//   secondPreference: 'Industry'
// }

// // Accept token from frontend authorization
// const token = ctx.request.get('Authorization').split(' ')[1];
// // Use jwt to verify token
// const re = ctx.app.jwt.verify(token, ctx.app.config.jwt.secret);
// if (!re.hasOwnProperty('id')) {
//   ctx.body = { error: 'no token' };
// }
