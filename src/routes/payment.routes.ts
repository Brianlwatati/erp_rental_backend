import { Router } from "express";
import * as c from "../controllers/payment.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import { paymentCreateSchema, allocationInputSchema, receiptCreateSchema } from "../schemas/payment.schema";

const r = Router();
r.get("/", authorize("payment", "view"), c.list);
r.post("/", authorize("payment", "create"), validateBody(paymentCreateSchema), c.create);
r.get("/receipts", authorize("payment", "view"), c.listReceipts);
r.get("/receipts/:id", authorize("payment", "view"), c.getReceipt);
r.get("/:id", authorize("payment", "view"), c.get);
r.post("/:id/allocate", authorize("payment", "update"), validateBody(allocationInputSchema), c.allocate);
r.post("/:id/reverse", authorize("payment", "update"), c.reverse);
r.post("/:id/receipt", authorize("payment", "update"), validateBody(receiptCreateSchema), c.issueReceipt);
r.delete("/:id", authorize("payment", "delete"), c.remove);
export default r;
