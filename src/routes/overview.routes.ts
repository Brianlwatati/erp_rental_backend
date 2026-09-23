import { Router } from "express";
import * as controller from "../controllers/overview.controller";
import { authorize } from "../middleware/authorize";

const router = Router();
router.use(authorize("property", "view"));
router.get("/", controller.getOverview);

export default router;
