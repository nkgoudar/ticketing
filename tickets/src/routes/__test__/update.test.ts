import request from "supertest";
import { app } from "../../app";
import { mongoId, signin } from "../../test/helper";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the provided id does not exist", async () => {
  const id = mongoId();
  const cookie = await signin();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({
      title: "sadasd",
      price: 20,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = mongoId();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "sadasd",
      price: 20,
    })
    .expect(401);
});

it("returns a 401 if the user does not own a ticket", async () => {
  const cookie1 = await signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie1)
    .send({
      title: "dasdasd",
      price: 20,
    });

  const cookie2 = await signin();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie2)
    .send({
      title: "SDDSD",
      price: 90,
    })
    .expect(401);
});

it("returns 400 if the user provides an invalid title or pice", async () => {
  const cookie = await signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "dasdasd",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdasd",
      price: -10,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: -10,
    })
    .expect(400);
});

it("updates the ticket provided valid tickets", async () => {
  const cookie = await signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "dasdasd",
      price: 20,
    });
  const title = "shakalaka boom boom";
  const price = 50;
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title,
      price,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it("publishes an event", async () => {
  const cookie = await signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "dasdasd",
      price: 20,
    });
  const title = "shakalaka boom boom";
  const price = 50;
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title,
      price,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  const cookie = await signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "dasdasd",
      price: 20,
    });
  const title = "shakalaka boom boom";
  const price = 50;
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({orderId: mongoId()});
  await ticket!.save();
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title,
      price,
    })
    .expect(400);
});
