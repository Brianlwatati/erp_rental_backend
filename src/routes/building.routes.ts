import { Router } from "express";
import * as c from "../controllers/building.controller";
import { validateBody } from "../middleware/validation.middleware";
import { authorize } from "../middleware/authorize";
import {
  buildingCreateSchema,
  buildingUpdateSchema,
} from "../schemas/property.schema";
const r = Router();
r.use(authorize("building", "view"));
r.get("/property/:propertyId", c.list);
r.post("/property/:propertyId", validateBody(buildingCreateSchema), c.create);
r.get("/:id", c.get);
r.patch("/:id", validateBody(buildingUpdateSchema), c.update);
r.delete("/:id", c.remove);
export default r;
