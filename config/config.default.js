/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1724928219233_4054';

  // add your middleware config here
  config.middleware = [ 'jwtAuth' ];

  // Token verify router
  config.jwtAuth = {
    match: [ '/api/completeApplication', '/api/userProfileData', '/api/allStudents', '/api/getTokenExpirationDate' ],
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };


  // Sequelize
  // NZ Auckland Time Zone
  const utcDate = new Date();
  const timezoneOffsetInMinutes = utcDate.getTimezoneOffset();
  const timezoneOffsetInHours = timezoneOffsetInMinutes / 60;
  const formattedOffset = timezoneOffsetInHours >= 0 ? `UTC-${Math.abs(timezoneOffsetInHours).toString().padStart(2, '0')}:00` : `UTC+${Math.abs(timezoneOffsetInHours).toString().padStart(2, '0')}:00`;
  exports.sequelize = {
    dialect: 'mysql',
    host: process.env.DB_HOST || '10.150.2.100',
    port: process.env.DB_PORT || '3306',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'ABCabc_123',
    database: process.env.DB_NAME || 'internship_application',
    timezone: formattedOffset.split('UTC')[1],
  };

  // NodeMailer
  exports.mail = {
    service: process.env.EMAIL_SERVICE || 'Gmail',
    user: process.env.EMAIL_USER || 'zihanzhang0628@gmail.com',
    pass: process.env.EMAIL_PASS || 'ifzt akwf trta kajd',
    sender: 'Wintec Centre For IT',
  };

  // Security
  exports.security = {
    csrf: {
      enable: false,
      ignoreJson: true,
    },
  };

  // Jason Web Token
  config.jwt = {
    secret: 'MyIRMJasonWenTokenEncryption',
  };

  // CORS
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  return {
    ...config,
    ...userConfig,
  };
};
