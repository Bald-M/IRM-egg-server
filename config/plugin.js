/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  mysql: {
    enable: true,
    package: 'mysql',
  },
  sequelize: {
    enable: true,
    package: 'egg-sequelize',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  nodemailer: {
    enable: true,
    package: 'nodemailer',
  },
  jwt: {
    enable: true,
    package: 'egg-jwt',
  },
};
