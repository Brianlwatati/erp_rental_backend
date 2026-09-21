import { Router } from "express";
import * as c from "../controllers/payment.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import {
  paymentCreateSchema,
  allocationInputSchema,
  receiptCreateSchema,
} from "../schemas/payment.schema";

const r = Router();
r.use(authorize("payment", "view"));
r.get("/", c.list);
r.post("/", validateBody(paymentCreateSchema), c.create);
r.get("/receipts", c.listReceipts);
r.get("/receipts/:id", c.getReceipt);
r.get("/:id", c.get);
r.post("/:id/allocate", validateBody(allocationInputSchema), c.allocate);
r.post("/:id/reverse", c.reverse);
r.post("/:id/receipt", validateBody(receiptCreateSchema), c.issueReceipt);
r.delete("/:id", c.remove);
export default r;
