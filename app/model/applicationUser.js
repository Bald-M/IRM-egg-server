'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, ENUM, DATE } = app.Sequelize;

  const ApplicationUser = app.model.define(
    // Table Name
    // is_deleted: { type: BOOLEAN, default: false },
    'application_user',
    {
      app_user_id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      username: STRING(40),
      email: STRING(80),
      password: STRING(225),
      type: ENUM('Student', 'Client', 'IRM User', 'Admin'),
      status: ENUM('Pending', 'Active', 'Blocked', 'Removed'),
      registered_date: DATE,
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return ApplicationUser;
};

