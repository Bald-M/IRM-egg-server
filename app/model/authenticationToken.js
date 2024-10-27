'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const AuthenticationToken = app.model.define(
    // Table Name
    'authentication_token',
    {
      auth_token_id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      app_user_id: INTEGER,
      token: STRING(255),
      expiration_date: DATE,
      updated_date: DATE,
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return AuthenticationToken;
};

