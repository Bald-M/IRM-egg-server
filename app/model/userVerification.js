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

// verification_id (INT):

// 这是验证记录的唯一标识符，主键且自动递增。用于唯一地标识每条验证记录。
// app_user_id (INT):

// 外键，引用 Application User 表中的 app_user_id。这表示哪位用户正在进行验证。
// server_ref (VARCHAR(48)):

// 服务器引用，用于跟踪特定的登录或 OTP（一次性密码）流程。可以用来唯一标识一个验证请求，便于追踪和排错。
// verification_code (VARCHAR):

// 验证码，用于验证用户的身份。这可以是发送给用户的 OTP 或电子邮件验证代码。
// verification_type (ENUM):

// 验证类型，可能的值为 1（邮箱验证）和 2（忘记密码）。这用于区分不同类型的验证请求。
// status (ENUM):

// 当前验证的状态，可能的值为 1（活跃）和 0（非活跃）。这用于控制验证请求是否还有效。
// updated_date (DATETIME):

// 最后更新的日期。用于记录这条验证记录的最后更新时间。
