import { Response, Router, Request } from "express";

export const routes = (router: Router) => {
  router.get("/api/test", (req: Request, res: Response) => {
    res.send({ message: "test123" });
  });
  
};
