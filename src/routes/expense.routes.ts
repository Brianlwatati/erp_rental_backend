import { Router } from "express";
import * as c from "../controllers/expense.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import {
  expenseCreateSchema,
  expenseUpdateSchema,
} from "../schemas/expense.schema";

const r = Router();
r.use(authorize("expense", "view"));
r.get("/", c.listExpenses);
r.post("/", validateBody(expenseCreateSchema), c.createExpense);
r.get("/:id", c.getExpense);
r.patch("/:id", validateBody(expenseUpdateSchema), c.updateExpense);
r.delete("/:id", c.removeExpense);
export default r;
