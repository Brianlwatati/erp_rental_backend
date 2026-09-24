import { Router } from "express";
import * as c from "../controllers/expense.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import { vendorCreateSchema, vendorUpdateSchema } from "../schemas/expense.schema";

const r = Router();
r.get("/", authorize("expense", "view"), c.listVendors);
r.post("/", authorize("expense", "create"), validateBody(vendorCreateSchema), c.createVendor);
r.get("/:id", authorize("expense", "view"), c.getVendor);
r.patch("/:id", authorize("expense", "update"), validateBody(vendorUpdateSchema), c.updateVendor);
r.delete("/:id", authorize("expense", "delete"), c.removeVendor);
export default r;
