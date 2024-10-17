'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, ENUM, DATE } = app.Sequelize;

  const Student = app.model.define(
    'student',
    {
      student_id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      app_user_id: INTEGER,
      name: STRING(255),
      wintec_id: STRING(20),
      gender: ENUM('Male', 'Female'),
      student_type: ENUM('Domestic Student', 'International Student'),
      personal_email: STRING(255),
      student_email: STRING(255),
      phone_number: STRING(255),
      personal_statement: STRING(512),
      cv_link: STRING(255),
      linkedin_link: STRING(255),
      portfolio_link: STRING(255),
      github_link: STRING(255),
      average_grade: STRING(10),
      programme_of_study: STRING(255),
      area_of_study: STRING(255),
      internship_options: STRING(255),
      preferred_companies: STRING(255),
      first_preference: STRING(255),
      second_preference: STRING(255),
      skills: STRING(255),
      favourite_courses: STRING(255),
      reference: STRING(50),
      speciality: STRING(255),
      qualification_type: STRING(255),
      submission_date: DATE,
      review_status: STRING(50),
      interview_readiness: ENUM('TRUE', 'FALSE'),
      app_status: INTEGER,
      intern_status: INTEGER,
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Student;
};
