import { Model } from "../lib/DB.js";

class UserModel extends Model {
  constructor() {
    const schema = {
      fullName: {
        type: "string",
        required: true,
      },
      email: {
        type: "string",
        required: true,
        unique: true, // enforce unique index
        validate: (v, f) => {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!re.test(v)) throw new Error(`${f} must be a valid email`);
        },
      },
      password: {
        type: "string",
        required: true,
      },
      profilePic: {
        type: "string",
        default: null,
      },
    };

    super("Users", schema);
  }

  findByEmail(email) {
    return this.findOne({ email });
  }
}

export default new UserModel();
