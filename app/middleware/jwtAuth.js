// app/utils/jwtAuth.js

/**
 * JWT authentication middleware.
 * This middleware validates the JWT token from the request's Authorization header.
 * If the token is valid, it decodes the token and adds the user information to ctx.state for further use.
 * If the token is missing, invalid, or expired, it responds with a 401 status and an appropriate error message.
 *
 * @param {Object} options - Middleware options (can be configured if needed).
 * @return {Function} Middleware function that handles JWT authentication.
 */
module.exports = (options) => {
  return async function jwtAuth(ctx, next) {
    // Retrieve the Authorization token from the request header
    const token = ctx.request.headers.authorization;
    console.log(token);

    // If the token is not provided or is incorrectly formatted
    if (!token || !token.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = { error: 'Authentication failed: No token provided' };
      return;
    }

    try {
      // Extract the actual token by removing the "Bearer " prefix
      const authToken = token.split(' ')[1];
      // Check if the token exists in the database
      const authentication_token = await ctx.app.model.AuthenticationToken.findOne({
        where: {
          token: authToken,
        },
      });
      // If the token is not found in the database
      if (!authentication_token) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication failed: Token mismatch or not found' };
        return;
      }
      // Validate token expiration date
      const expiration_date = new Date(authentication_token.expiration_date);
      const current_date = new Date();

      if (expiration_date < current_date) {
        throw new Error('Token Authentication Error', { cause: 'Authentication failed: Invalid or expired token' });
      }
      // If validation passes, proceed to the next middleware or controller
      await next();
    } catch (error) {
      // Handle JWT validation errors and return 401 status with appropriate error messages
      switch (error.cause) {
        case 'Authentication failed: Invalid or expired token':
          ctx.status = 401;
          ctx.body = { error: error.cause };
          break;
        default:
          break;
      }
    }
  };
};

