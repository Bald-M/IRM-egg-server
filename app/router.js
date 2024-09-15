/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // Register Interface Router
  router.post('/api/registration', controller.login.register);
  // Login Interface Router
  router.post('/api/login', controller.login.login);
};
