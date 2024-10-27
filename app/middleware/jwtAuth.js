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
    // 从请求头中获取 Authorization token
    const token = ctx.request.headers.authorization;

    // 如果没有提供 token 或者格式不正确
    if (!token || !token.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = { error: 'Authentication failed: No token provided' };
      return;
    }

    try {
      // 获取 token，并移除 "Bearer " 前缀
      const authToken = token.split(' ')[1];

      const authentication_token = await ctx.app.model.AuthenticationToken.findOne({
        where: {
          token: authToken,
        },
      });

      if (!authentication_token) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication failed: Token mismatch or not found' };
        return;
      }

      const expiration_date = new Date(authentication_token.expiration_date);
      const current_date = new Date();

      if (expiration_date < current_date) {
        throw new Error('Token Authentication Error', { cause: 'Authentication failed: Invalid or expired token' });
      }
      // 验证成功，继续处理请求
      await next();
    } catch (error) {
      // 捕获 JWT 验证错误，返回 401 状态码和错误信息
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

