import { Router } from "express";
import * as c from "../controllers/unit-type.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import {
  unitTypeCreateSchema,
  unitTypeUpdateSchema,
} from "../schemas/property.schema";

const r = Router();
r.use(authorize("unit", "view"));
r.get("/", c.list);
r.post(
  "/",
  authorize("unit", "create"),
  validateBody(unitTypeCreateSchema),
  c.create,
);
r.get("/:id", c.get);
r.patch(
  "/:id",
  authorize("unit", "update"),
  validateBody(unitTypeUpdateSchema),
  c.update,
);
r.delete("/:id", authorize("unit", "delete"), c.remove);

export default r;
