import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { buildTicket, mongoId, signin } from "../../test/helper";
import { natsWrapper } from "../../nats-wrapper";

it("returns an error if the ticket does not exist", async () => {
  const ticketId = mongoId();
  const cookie = await signin();

  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = await buildTicket();
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: "dsadasdas",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  const cookie = await signin();
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const len = (await Order.find({})).length;
  const ticket = await buildTicket();
  await ticket.save();

  const cookie = await signin();
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  const length = (await Order.find({})).length;
  expect(length).toEqual(len + 1);
});

it("emits an order created event", async () => {
  const len = (await Order.find({})).length;
  const ticket = await buildTicket();
  await ticket.save();

  const cookie = await signin();
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  const length = (await Order.find({})).length;
  expect(length).toEqual(len + 1);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
