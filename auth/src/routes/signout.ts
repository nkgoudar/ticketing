import { currentUser, requireAuth } from "@nk-tickets/common";
import express from "express";

const router = express.Router();

router.post("/api/users/signout",currentUser, requireAuth, async (req, res) => {
  req.session = null;

  res.send();
});

export { router as signuoutRouter };
