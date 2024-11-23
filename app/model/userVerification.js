'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, ENUM, DATE } = app.Sequelize;

  const UserVerification = app.model.define(
    'user_verification',
    {
      verification_id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      app_user_id: INTEGER,
      server_ref: STRING(48),
      code: STRING(6),
      type: ENUM('Email Verification', 'Forgot Password'),
      status: ENUM('Active', 'Inactive'),
      expiration_date: DATE,
      updated_date: DATE,
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return UserVerification;
};

