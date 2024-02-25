import { AuthMiddleware } from './middleware/auth.middleware';
import { Router } from "express";
import { AuthenticatedUser, FacebookAuth, Login, Logout, Register, ResendVerify, UpdateInfo, UpdatePassword, VerifyAccount, googleAuth } from "./controller/auth.controller";

export const routes = (router: Router) => {
  router.post("/api/user/register", Register);
  router.post("/api/admin/login", Login);
  router.post("/api/user/login", Login);
  router.post("/api/user/google-auth", googleAuth);
  router.post("/api/user/facebook-auth", FacebookAuth);
  router.get("/api/admin", AuthMiddleware, AuthenticatedUser);
  router.get("/api/user", AuthMiddleware, AuthenticatedUser);
  router.post("/api/admin/logout", AuthMiddleware, Logout);
  router.post("/api/user/logout", AuthMiddleware, Logout);
  router.put("/api/admin/info", AuthMiddleware, UpdateInfo);
  router.put("/api/user/info", AuthMiddleware, UpdateInfo);
  router.put("/api/admin/password", AuthMiddleware, UpdatePassword);
  router.put("/api/user/password", AuthMiddleware, UpdatePassword);
  router.post("/api/verify", ResendVerify);

  router.put("/api/verify/:token", VerifyAccount);
};
