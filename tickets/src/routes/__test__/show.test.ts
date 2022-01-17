import request from "supertest";
import { app } from "../../app";
import { mongoId, signin } from "../../test/helper";

it("returns a 404 if the ticker is not found", async () => {
  const id = mongoId();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const title = "asdasd";
  const price = 20;
  const cookie = await signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price,
    })
    .expect(201);
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
