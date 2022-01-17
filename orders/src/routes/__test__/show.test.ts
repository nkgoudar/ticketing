import request from "supertest";
import { app } from "../../app";
import { buildTicket, signin } from "../../test/helper";

it("fetches the order", async () => {
  // Create a ticket
  const ticket = await buildTicket();

  const cookie = await signin();
  // make a request to builf an order with this ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns an error if one user tries to fetch another user's order", async () => {
  // Create a ticket
  const ticket = await buildTicket();

  const cookie1 = await signin();
  // make a request to builf an order with this ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie1)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  const cookie2 = await signin();
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", cookie2)
    .send()
    .expect(401);
});
