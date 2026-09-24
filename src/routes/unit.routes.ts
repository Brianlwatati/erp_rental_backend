import { Router } from "express";
import * as c from "../controllers/unit.controller";
import { validateBody } from "../middleware/validation.middleware";
import { authorize } from "../middleware/authorize";
import { unitCreateSchema, unitUpdateSchema } from "../schemas/property.schema";

const r = Router();
r.get("/building/:buildingId", authorize("unit", "view"), c.list);
r.post("/building/:buildingId", authorize("unit", "create"), validateBody(unitCreateSchema), c.create);
r.get("/:id", authorize("unit", "view"), c.get);
r.patch("/:id", authorize("unit", "update"), validateBody(unitUpdateSchema), c.update);
r.delete("/:id", authorize("unit", "delete"), c.remove);
export default r;
