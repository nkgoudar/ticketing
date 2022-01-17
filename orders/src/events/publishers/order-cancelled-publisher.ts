import { OrderCancelledEvent, Publisher, Subjects } from "@nk-tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}