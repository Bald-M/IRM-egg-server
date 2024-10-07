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

  // Exclude token verify router
  config.jwtAuth = {
    match: [ '/api/completeApplication' ],
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // Mysql
  // https://www.eggjs.org/tutorials/mysql
  exports.mysql = {
    client: {
      host: '47.250.88.49',
      port: 3306,
      user: 'root',
      password: 'ABCabc_123',
      database: 'internship_application',
      define: {
        freezeTableName: true,
      },
    },
    // Mount to app
    app: true,
    // Mount to agent
    agent: false,
  };

  // Sequelize
  exports.sequelize = {
    dialect: 'mysql',
    host: '10.150.2.100',
    port: 3306,
    user: 'root',
    password: 'ABCabc_123',
    database: 'internship_application',
    // NZ Auckland Time Zone
    timezone: '+12:00',
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
