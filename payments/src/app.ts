import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@nk-tickets/common";
import { CreateChargeRouter } from "./routes/new";
import { InitiateRouter } from "./routes/initiate-transaction";
import { UpdatePaymentRouter } from "./routes/update-payment";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);

app.use(CreateChargeRouter);
app.use(InitiateRouter);
app.use(UpdatePaymentRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
