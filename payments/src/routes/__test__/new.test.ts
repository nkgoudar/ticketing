import { OrderStatus } from "@nk-tickets/common";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { mongoId, signin } from "../../test/helper";

jest.mock("../../stripe");

it("returns a 404 when purchasing an order that does not exist", async () => {
  const cookie = await signin();
  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({
      token: "dasdasd",
      orderId: mongoId(),
    })
    .expect(404);
});

it("returns a 401 when purchasing an order that doesnt belong to the user", async () => {
  const order = Order.build({
    id: mongoId(),
    userId: mongoId(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  const cookie = await signin();

  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({
      token: "dasdasd",
      orderId: order.id,
    })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = mongoId();

  const order = Order.build({
    id: mongoId(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  const cookie = await signin(userId);

  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({
      token: "sadasdasd",
      orderId: order.id,
    })
    .expect(400);
});

// it("returns a 202 with valid inputs", async () => {
//   const userId = mongoId();
//   const cookie = signin(userId);
//   const order = Order.build({
//     id: mongoId(),
//     userId,
//     version: 0,
//     price: 20,
//     status: OrderStatus.Created,
//   });
//   await order.save();

//   await request(app).post("/api/payments").set("Cookie", cookie).send({
//     token: "tok_visa",
//     orderId: order.id,
//   });

//   // check payment creation after payment
// });
