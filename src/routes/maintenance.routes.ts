import { Router } from "express";
import * as c from "../controllers/maintenance.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import {
  maintenanceRequestCreateSchema,
  maintenanceRequestUpdateSchema,
  maintenanceAssignSchema,
  maintenanceCostCreateSchema,
} from "../schemas/maintenance.schema";

const r = Router();
r.use(authorize("maintenance", "view"));
r.get("/", c.list);
r.post("/", validateBody(maintenanceRequestCreateSchema), c.create);
r.get("/:id", c.get);
r.patch("/:id", validateBody(maintenanceRequestUpdateSchema), c.update);
r.post("/:id/assign", validateBody(maintenanceAssignSchema), c.assign);
r.post("/:id/start", c.start);
r.post("/:id/complete", c.complete);
r.post("/:id/cancel", c.cancel);
r.delete("/:id", c.remove);
r.get("/:requestId/costs", c.listCosts);
r.post(
  "/:requestId/costs",
  validateBody(maintenanceCostCreateSchema),
  c.addCost,
);
r.delete("/costs/:id", c.removeCost);
export default r;
