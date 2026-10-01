import { Router } from "express";
import * as c from "../controllers/notifications.controller";

const r = Router();
r.get("/", c.list);
r.get("/unread-count", c.unreadCount);
r.patch("/read-all", c.markAllRead);
r.patch("/:id/read", c.markRead);
export default r;
