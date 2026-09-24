import { Router } from "express";
import * as c from "../controllers/building.controller";
import { validateBody } from "../middleware/validation.middleware";
import { authorize } from "../middleware/authorize";
import { buildingCreateSchema, buildingUpdateSchema } from "../schemas/property.schema";

const r = Router();
r.get("/all", authorize("building", "view"), c.allbuildings);
r.get("/property/:propertyId", authorize("building", "view"), c.list);
r.post("/property/:propertyId", authorize("building", "create"), validateBody(buildingCreateSchema), c.create);
r.get("/:id", authorize("building", "view"), c.get);
r.patch("/:id", authorize("building", "update"), validateBody(buildingUpdateSchema), c.update);
r.delete("/:id", authorize("building", "delete"), c.remove);
export default r;
