'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, ENUM, DATE, BOOLEAN } = app.Sequelize;

  const User = app.model.define(
    // Table Name
    'Users',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      username: STRING(40),
      email: STRING(80),
      password: STRING(225),
      role: ENUM('Student', 'Client', 'IRM User', 'Admin'),
      status: ENUM('Pending', 'Active', 'Blocked', 'Removed'),
      registration_date: DATE,
      is_deleted: { type: BOOLEAN, default: false },
    },
    {
      timestamps: false,
    }
  );

  return User;
};

// freezeTableName: true
// underscored: true
