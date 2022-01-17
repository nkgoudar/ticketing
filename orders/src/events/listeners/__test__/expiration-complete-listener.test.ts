import { ExpirationCompleteEvent } from "@nk-tickets/common";
import { Message } from "node-nats-streaming";
import { Order, OrderStatus } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { mongoId } from "../../../test/helper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
    id: mongoId(),
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: mongoId(),
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { data, listener, ticket, order, msg };
};

it("updates the order status to cancelled", async () => {
  const { data, listener, ticket, order, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emit an Order cancelled event", async () => {
  const { data, listener, order, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
