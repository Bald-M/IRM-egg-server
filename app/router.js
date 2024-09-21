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
  // Email Verification Router
  router.post('/api/emailVerification', controller.login.emailVerification);
  // Send OTP Router (In case OTP is expired)
  router.post('/api/sendOTP', controller.login.sendOTP);
  // Forgot Password Request Router
  router.post('/api/forgotPassRequest', controller.login.forgotPasswordRequest);
};
