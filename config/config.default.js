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
  config.middleware = [];

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
    host: '47.250.88.49',
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
    user: 'zhang241166@gmail.com',
    pass: 'ihqf eewy rehi htjr',
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
