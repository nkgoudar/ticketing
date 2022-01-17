import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties that are required ro create a new User
interface UserAttrs {
  // user Attributes
  email: string;
  password: string;
}

// An interface that describes the properties that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties that a User document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  try {
    if (this.isModified("password")) {
      const hashed = await Password.toHash(this.get("password"));
      this.set("password", hashed);
    }
    done();
  } catch (err) {}
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

const user = User.build({
  email: "sad",
  password: "asd",
});

export { User };
