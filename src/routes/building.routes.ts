import { Router } from "express";
import * as c from "../controllers/building.controller";
import {
  validateBody,
  validateUuidParam,
} from "../middleware/validation.middleware";
import { authorize } from "../middleware/authorize";
import {
  buildingCreateSchema,
  buildingUpdateSchema,
} from "../schemas/property.schema";

const r = Router();
r.get("/all", authorize("building", "view"), c.allbuildings);
r.get(
  "/property/:propertyId",
  authorize("building", "view"),
  validateUuidParam("propertyId"),
  c.list,
);
r.post(
  "/property/:propertyId",
  authorize("building", "create"),
  validateUuidParam("propertyId"),
  validateBody(buildingCreateSchema),
  c.create,
);
r.get("/:id", authorize("building", "view"), validateUuidParam("id"), c.get);
r.get(
  "/:id/units",
  authorize("building", "view"),
  validateUuidParam("id"),
  c.getUnits,
);
r.patch(
  "/:id",
  authorize("building", "update"),
  validateUuidParam("id"),
  validateBody(buildingUpdateSchema),
  c.update,
);
r.delete(
  "/:id",
  authorize("building", "delete"),
  validateUuidParam("id"),
  c.remove,
);
export default r;
