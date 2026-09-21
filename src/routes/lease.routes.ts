import { Router } from "express";
import * as c from "../controllers/lease.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import {
  leaseCreateSchema,
  leaseUpdateSchema,
  leaseTerminateSchema,
  leaseChargeCreateSchema,
} from "../schemas/lease.schema";

const r = Router();
r.use(authorize("lease", "view"));
r.get("/", c.list);
r.post("/", validateBody(leaseCreateSchema), c.create);
r.get("/:id", c.get);
r.patch("/:id", validateBody(leaseUpdateSchema), c.update);
r.post("/:id/terminate", validateBody(leaseTerminateSchema), c.terminate);
r.delete("/:id", c.remove);
r.get("/:leaseId/charges", c.listCharges);
r.post("/:leaseId/charges", validateBody(leaseChargeCreateSchema), c.addCharge);
r.delete("/charges/:id", c.removeCharge);
export default r;
