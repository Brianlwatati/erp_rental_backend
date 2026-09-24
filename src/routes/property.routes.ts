import { Router } from "express";
import * as c from "../controllers/property.controller";
import { validateBody } from "../middleware/validation.middleware";
import { authorize } from "../middleware/authorize";
import { propertyCreateSchema, propertyUpdateSchema } from "../schemas/property.schema";

const r = Router();
r.get("/", authorize("property", "view"), c.list);
r.get("/:id", authorize("property", "view"), c.get);
r.post("/", authorize("property", "create"), validateBody(propertyCreateSchema), c.create);
r.patch("/:id", authorize("property", "update"), validateBody(propertyUpdateSchema), c.update);
r.delete("/:id", authorize("property", "delete"), c.remove);
export default r;
