import type { AccessTokenUser } from "../modules/auth/auth.types.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenUser;
      requestId?: string;
    }
  }
}

export {};
