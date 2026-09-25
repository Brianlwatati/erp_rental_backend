import { Router } from "express";
import * as c from "../controllers/expense.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import {
  expenseCreateSchema,
  expenseUpdateSchema,
} from "../schemas/expense.schema";

const r = Router();
r.get("/", authorize("expense", "view"), c.listExpenses);
r.post(
  "/",
  authorize("expense", "create"),
  validateBody(expenseCreateSchema),
  c.createExpense,
);
r.get("/:id", authorize("expense", "view"), c.getExpense);

// put and patch are both supported for updating an expense in
// future versions will update, but for now, we will use put for full updates and patch for partial updates.
// Both will call the same controller function.
r.put(
  "/:id",
  authorize("expense", "update"),
  validateBody(expenseUpdateSchema),
  c.updateExpense,
);
r.patch(
  "/:id",
  authorize("expense", "update"),
  validateBody(expenseUpdateSchema),
  c.updateExpense,
);
r.delete("/:id", authorize("expense", "delete"), c.removeExpense);
export default r;
