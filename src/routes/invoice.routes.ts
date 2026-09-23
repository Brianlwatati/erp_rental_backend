import { Router } from "express";
import * as c from "../controllers/invoice.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import {
  invoiceCreateSchema,
  invoiceUpdateSchema,
  invoiceItemInputSchema,
} from "../schemas/billing.schema";

const r = Router();
r.use(authorize("invoice", "view"));
r.get("/", c.list);
r.get("/not-fully-paid", c.listNotFullyPaid);
r.post("/", validateBody(invoiceCreateSchema), c.create);
r.get("/:id", c.get);
r.patch("/:id", validateBody(invoiceUpdateSchema), c.update);
r.post("/:id/issue", c.issue);
r.post("/:id/cancel", c.cancel);
r.delete("/:id", c.remove);
r.get("/:invoiceId/items", c.listItems);
r.post("/:invoiceId/items", validateBody(invoiceItemInputSchema), c.addItem);
r.delete("/items/:id", c.removeItem);
export default r;
