import { Router } from "express";
import * as c from "../controllers/expense.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import {
  vendorCreateSchema,
  vendorUpdateSchema,
} from "../schemas/expense.schema";

const r = Router();
r.use(authorize("expense", "view"));
r.get("/", c.listVendors);
r.post("/", validateBody(vendorCreateSchema), c.createVendor);
r.get("/:id", c.getVendor);
r.patch("/:id", validateBody(vendorUpdateSchema), c.updateVendor);
r.delete("/:id", c.removeVendor);
export default r;
