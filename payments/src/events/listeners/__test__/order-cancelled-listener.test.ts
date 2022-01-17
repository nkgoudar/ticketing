import { OrderCancelledEvent, OrderStatus } from "@nk-tickets/common";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { mongoId } from "../../../test/helper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: mongoId(),
    status: OrderStatus.Created,
    price: 10,
    userId: mongoId(),
    version: 0,
  });

  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: mongoId(),
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, order, msg };
};

it("udpates the status of the order", async ()=> {
  const { listener, data, order, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it("acks the message ", async ()=> {
  const { listener, data, order, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
})