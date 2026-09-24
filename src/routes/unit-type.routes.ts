import { Router } from "express";
import * as c from "../controllers/unit-type.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import { unitTypeCreateSchema, unitTypeUpdateSchema } from "../schemas/property.schema";

const r = Router();
r.get("/", authorize("unit", "view"), c.list);
r.post("/", authorize("unit", "create"), validateBody(unitTypeCreateSchema), c.create);
r.get("/:id", authorize("unit", "view"), c.get);
r.patch("/:id", authorize("unit", "update"), validateBody(unitTypeUpdateSchema), c.update);
r.delete("/:id", authorize("unit", "delete"), c.remove);
export default r;
