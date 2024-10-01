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

      // 使用 jwt 验证 token
      const decoded = ctx.app.jwt.verify(authToken, ctx.app.config.jwt.secret);

      // 将解码后的用户信息添加到 ctx.state，供后续中间件使用
      ctx.state.user = decoded;

      // 验证成功，继续处理请求
      await next();
    } catch (err) {
      // 捕获 JWT 验证错误，返回 401 状态码和错误信息
      ctx.status = 401;
      ctx.body = { error: 'Authentication failed: Invalid or expired token' };
    }
  };
};

// function jwtAuth(ctx, next) {
//   const token = ctx.request.headers.authorization;
//   if (!token || token.startsWith('Bearer ')) {
//     ctx.status = 401;
//     ctx.body = { error: 'Authentication failed: No token provided' };
//     return;
//   }

//   try {
//     const authToken = token.split(' ')[1];
//     const decoded = ctx.app.jwt.verify(authToken, ctx.app.config.jwt.secret);
//     ctx.state.user = decoded;
//     return next();
//   } catch (err) {
//     ctx.status = 401;
//     ctx.body = { error: 'Authentication failed: Invalid or expired token' };
//   }
// }

// module.exports = {
//   jwtAuth,
// };
