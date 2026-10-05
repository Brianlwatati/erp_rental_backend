import { Router } from "express";
import * as c from "../controllers/unit.controller";
import {
  validateBody,
  validateUuidParam,
} from "../middleware/validation.middleware";
import { authorize } from "../middleware/authorize";
import { unitCreateSchema, unitUpdateSchema } from "../schemas/property.schema";

const r = Router();
r.get(
  "/building/:buildingId",
  authorize("unit", "view"),
  validateUuidParam("buildingId"),
  c.list,
);
r.get(
  "/property/:propertyId",
  authorize("unit", "view"),
  validateUuidParam("propertyId"),
  c.listbyProperty,
);
r.post(
  "/building/:buildingId",
  authorize("unit", "create"),
  validateUuidParam("buildingId"),
  validateBody(unitCreateSchema),
  c.create,
);
r.get("/:id", authorize("unit", "view"), validateUuidParam("id"), c.get);
r.patch(
  "/:id",
  authorize("unit", "update"),
  validateUuidParam("id"),
  validateBody(unitUpdateSchema),
  c.update,
);
r.delete(
  "/:id",
  authorize("unit", "delete"),
  validateUuidParam("id"),
  c.remove,
);
export default r;
