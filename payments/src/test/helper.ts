import jwt from "jsonwebtoken";
import mongoose from "mongoose";
// import { Ticket } from "../models/ticket";

export const signin = (id?: string) => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: id || mongoId(),
    email: "test@test.com",
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // Return a string thats the cookie with the encoded data
  return [`session=${base64}`];
};

export const mongoId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};

// export const buildTicket = async () => {
//   const ticket = Ticket.build({
//     title: "concert",
//     price: 20,
//     userId: mongoId()
//   });

//   await ticket.save();

//   return ticket;
// };