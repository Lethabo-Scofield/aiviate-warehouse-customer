import jwt from "jsonwebtoken";
import { legacyEnv } from "./legacy-env";

export const signToken = (user: any): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "buyer",
    },
    legacyEnv.jwtSecret,
    { expiresIn: legacyEnv.jwtExpiresIn } as any,
  );
};
