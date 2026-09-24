import { Router } from "express";
import * as controller from "../controllers/overview.controller";
import { authorize } from "../middleware/authorize";

const router = Router();
router.get("/", authorize("property", "view"), controller.getOverview);
export default router;
