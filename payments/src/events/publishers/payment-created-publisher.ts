import { Publisher, PaymentCreatedEvent, Subjects } from "@nk-tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}