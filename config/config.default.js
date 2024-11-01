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
  // 'jwtAuth'
  config.middleware = [ 'jwtAuth' ];

  // Token verify router
  config.jwtAuth = {
    match: [ '/api/completeApplication', '/api/userProfileData', '/api/allStudents', '/api/getTokenExpirationDate' ],
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // Mysql
  // https://www.eggjs.org/tutorials/mysql
  // exports.mysql = {
  //   client: {
  //     host: '47.250.88.49',
  //     port: 3306,
  //     user: 'root',
  //     password: 'ABCabc_123',
  //     database: 'internship_application',
  //     define: {
  //       freezeTableName: true,
  //     },
  //   },
  //   // Mount to app
  //   app: true,
  //   // Mount to agent
  //   agent: false,
  // };

  // Sequelize
  // NZ Auckland Time Zone
  const utcDate = new Date();
  const timezoneOffsetInMinutes = utcDate.getTimezoneOffset();
  const timezoneOffsetInHours = timezoneOffsetInMinutes / 60;
  const formattedOffset = timezoneOffsetInHours >= 0 ? `UTC-${Math.abs(timezoneOffsetInHours).toString().padStart(2, '0')}:00` : `UTC+${Math.abs(timezoneOffsetInHours).toString().padStart(2, '0')}:00`;
  exports.sequelize = {
    dialect: 'mysql',
    host: '10.150.2.100',
    port: 3306,
    user: 'root',
    password: 'ABCabc_123',
    database: 'internship_application',
    timezone: formattedOffset.split('UTC')[1],
  };

  // NodeMailer
  exports.mail = {
    service: 'Gmail',
    user: 'zihanzhang0628@gmail.com',
    pass: 'ifzt akwf trta kajd',
    sender: 'Zihan Zhang',
  };

  // Security
  // Need to disable csrf in the future
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
