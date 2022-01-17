import { OrderCreatedEvent, Publisher, Subjects } from "@nk-tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}