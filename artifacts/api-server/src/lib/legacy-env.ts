const secretFromEnv = process.env.JWT_SECRET || process.env.SESSION_SECRET;

if (!secretFromEnv && process.env.NODE_ENV === "production") {
  throw new Error(
    "JWT_SECRET or SESSION_SECRET must be set in production.",
  );
}

export const legacyEnv = {
  jwtSecret: secretFromEnv || "change-this-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
