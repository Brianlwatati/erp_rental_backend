import { Router } from "express";
import * as c from "../controllers/lease.controller";
import { authorize } from "../middleware/authorize";
import {
  validateBody,
  validateUuidParam,
} from "../middleware/validation.middleware";
import {
  leaseCreateSchema,
  leaseUpdateSchema,
  leaseTerminateSchema,
  leaseChargeCreateSchema,
} from "../schemas/lease.schema";

const r = Router();
r.get("/", authorize("lease", "view"), c.list);
r.post(
  "/",
  authorize("lease", "create"),
  validateBody(leaseCreateSchema),
  c.create,
);
r.get("/:id", authorize("lease", "view"), c.get);
r.patch(
  "/:id",
  authorize("lease", "update"),
  validateBody(leaseUpdateSchema),
  c.update,
);
r.put(
  "/:id",
  authorize("lease", "update"),
  validateBody(leaseUpdateSchema),
  c.update,
);
r.post(
  "/:id/terminate",
  authorize("lease", "update"),
  validateBody(leaseTerminateSchema),
  c.terminate,
);
r.post(
  "/:id/extendleasemonthnew",
  authorize("lease", "update"),
  validateUuidParam("id"),
  c.extendLeaseMonthNew,
);
r.delete("/:id", authorize("lease", "delete"), c.remove);
r.get("/tenantleases/:id", authorize("lease", "view"), c.getTenantLeases);
r.get("/unitleases/:id", authorize("lease", "view"), c.getLeasesByUnitId);
r.get("/:leaseId/charges", authorize("lease", "view"), c.listCharges);
r.post(
  "/:leaseId/charges",
  authorize("lease", "update"),
  validateBody(leaseChargeCreateSchema),
  c.addCharge,
);
r.delete("/charges/:id", authorize("lease", "update"), c.removeCharge);
export default r;
