import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@nk-tickets/common";
import axios from "axios";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";
import { mid, PaytmChecksum } from "../paytm";

const router = express.Router();

router.post(
  "/api/payments/initiate",
  requireAuth,
  [body("orderId").not().isEmpty().withMessage("Order id is required")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for a cancelled order");
    }
    try {
      const payParams: any = {};

      payParams.body = {
        requestType: "Payment",
        mid,
        websiteName: "WEBSTAGING",
        orderId,
        callbackUrl: "https://ticketing.dev/api/payments/update",
        txnAmount: {
          value: order.price.toFixed(2),
          currency: "INR",
        },
        userInfo: {
          custId: order.userId,
        },
      };
      const checksum = await PaytmChecksum.generateSignature(
        JSON.stringify(payParams.body),
        process.env.PAYTM_KEY
      );
      payParams.head = {
        signature: checksum,
      };
      const { data } = await axios.post(
        `https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`,
        payParams,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      res.send({ token: data.body.txnToken });
    } catch (err) {
      console.error("PAYTM TOKEN GENERATION ERROR", err);
      throw new BadRequestError("PAYTM TOKEN GENERATION ERROR");
    }
  }
);

export { router as InitiateRouter };
