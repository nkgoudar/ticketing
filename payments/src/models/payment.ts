import mongoose, { Schema } from "mongoose";

interface PaymentAttrs {
  orderId: string;
  txnId: string;
  paymentDetails?: object;
}

interface PaymentDoc extends mongoose.Document {
  orderId: string;
  txnId: string;
  version: number;
  paymentDetails: object;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    txnId: {
      type: String,
      required: true,
    },
    paymentDetails: {
      type: Schema.Types.Mixed
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

paymentSchema.set("versionKey", "version");

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  "Payment",
  paymentSchema
);

export { Payment };
