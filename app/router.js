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
  // Forgot Password Verification Router
  router.post('/api/forgotPassVerify', controller.login.forgotPasswordVerify);
  // Reset Password Router
  router.post('/api/forgotPassChange', controller.login.forgotPasswordChange);
  // Get Token Expiration Date Time
  router.post('/api/getTokenExpirationDate', controller.login.getTokenExpirationDate);
  // Submit Student Application
  router.post('/api/completeApplication', controller.user.completeApplication);
  // Get Student Profile Data
  router.post('/api/userProfileData', controller.user.getStudentProfileData);
  // Get All Student
  router.get('/api/allStudents', controller.user.getAllStudent);
};
