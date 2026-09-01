const BEARER_PREFIX = "Bearer ";

export const parseBearerToken = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    req.teamAccessToken = null;
    return next();
  }

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith(BEARER_PREFIX)
  ) {
    const error = new Error("Authentication required.");

    error.status = 401;

    return next(error);
  }

  const token = authorization.slice(BEARER_PREFIX.length).trim();

  if (!token) {
    const error = new Error("Authentication required.");

    error.status = 401;

    return next(error);
  }

  req.teamAccessToken = token;

  return next();
};
