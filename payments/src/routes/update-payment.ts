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
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { natsWrapper } from "../nats-wrapper";
import { mid, PaytmChecksum } from "../paytm";

const router = express.Router();
router.post(
  "/api/payments/update",
  requireAuth,
  [body("orderId").notEmpty().withMessage("Order id is required")],
  validateRequest,
  async (req: Request, res: Response) => {

    console.log("PAYMENT UPDATE CALLED WITH BODY: ", req.body);

    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

    let paytmParams: any = {};
    paytmParams.body = {
      mid,
      orderId: "ORDER_1642260776724",
    };
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      process.env.PAYTM_KEY
    );

    paytmParams.head = {
      signature: checksum,
    };

    const { data } = await axios.post(
      "https://securegw-stage.paytm.in/v3/order/status",
      paytmParams
    );

    console.log("()()()()(", data)

    switch (data?.body?.resultInfo?.resultCode) {
      case "01":
        if (
          order.status === OrderStatus.Created ||
          order.status === OrderStatus.AwaitingPayment
        ) {
          const payment = Payment.build({
            orderId,
            txnId: data.body.txnId,
            paymentDetails: data,
          });
          await payment.save();
          await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId,
            txnId: payment.txnId,
          });
          res.send({ id: payment.id, success: true, payment }); // Remove payment from here
        } else if (order.status === OrderStatus.Cancelled) {
          // refund the amount
          throw new BadRequestError(data?.body?.resultInfo?.resultMsg);
        }
        break;
      default:
        const payment = Payment.build({
          orderId,
          txnId: data.body.txnId,
          paymentDetails: data,
        });
        payment.save();
        res.send({ success: false, payment }); // Remove payment from here
        break;
    }
  }
);

export { router as UpdatePaymentRouter };
