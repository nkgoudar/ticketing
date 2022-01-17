import request from "supertest";
import { app } from "../../app";
import { buildTicket, mongoId, signin } from "../../test/helper";

it("fetches orders for a particular user", async () => {
  const cookie1 = await signin(); // User #1
  const cookie2 = await signin(); // User #2

  // Create three tickets
  const ticket1 = await buildTicket();
  const ticket2 = await buildTicket();
  const ticket3 = await buildTicket();

  // Create one order as User #1
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie1)
    .send({ ticketId: ticket1.id })
    .expect(201);

  // Create two orders a s User #2
  const { body: order1 } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie2)
    .send({ ticketId: ticket2.id })
    .expect(201);

  const { body: order2 } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie2)
    .send({ ticketId: ticket3.id })
    .expect(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", cookie2)
    .send()
    .expect(200);

  // Make sure we only got the orders for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(order1.id);
  expect(response.body[1].id).toEqual(order2.id);
  expect(response.body[0].ticket.id).toEqual(ticket2.id);
  expect(response.body[1].ticket.id).toEqual(ticket3.id);
});
