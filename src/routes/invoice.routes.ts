import { Router } from "express";
import * as c from "../controllers/invoice.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import { invoiceCreateSchema, invoiceUpdateSchema, invoiceItemInputSchema } from "../schemas/billing.schema";

const r = Router();
r.get("/", authorize("invoice", "view"), c.list);
r.get("/not-fully-paid", authorize("invoice", "view"), c.listNotFullyPaid);
r.post("/", authorize("invoice", "create"), validateBody(invoiceCreateSchema), c.create);
r.get("/:id", authorize("invoice", "view"), c.get);
r.patch("/:id", authorize("invoice", "update"), validateBody(invoiceUpdateSchema), c.update);
r.post("/:id/issue", authorize("invoice", "update"), c.issue);
r.post("/:id/cancel", authorize("invoice", "update"), c.cancel);
r.delete("/:id", authorize("invoice", "delete"), c.remove);
r.get("/:invoiceId/items", authorize("invoice", "view"), c.listItems);
r.post("/:invoiceId/items", authorize("invoice", "update"), validateBody(invoiceItemInputSchema), c.addItem);
r.delete("/items/:id", authorize("invoice", "update"), c.removeItem);
export default r;
