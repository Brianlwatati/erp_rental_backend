import { Router } from "express";
import * as c from "../controllers/property.controller";
import { validateBody } from "../middleware/validation.middleware";
import { authorize } from "../middleware/authorize";
import {
  propertyCreateSchema,
  propertyUpdateSchema,
} from "../schemas/property.schema";
const r = Router();
r.use(authorize("property", "view"));
r.get("/", c.list);
r.get("/:id", c.get);
r.post("/", validateBody(propertyCreateSchema), c.create);
r.patch("/:id", validateBody(propertyUpdateSchema), c.update);
r.delete("/:id", c.remove);
export default r;
