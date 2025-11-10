import {
  Model
} from "../lib/DB.js";

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
        unique: true,
        // enforce unique index
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
      return this.findOne({
        email
      });
    }

    // New flexible patch method for partial updates
    async patch(id, updates) {
  // Step 1: Fetch existing user
  const user = await this.findOne({ _id: id });
  if (!user) {
    throw new Error("User not found");
  }

  // Step 2: Validate only the provided updates
  Object.keys(updates).forEach((field) => {
    const schemaField = this.schema[field];
    if (!schemaField) {
      throw new Error(`Invalid field: ${field}`);
    }
    const value = updates[field];
    if (value !== null && value !== undefined) {
      if (schemaField.type === "string" && typeof value !== "string") {
        throw new Error(`${field} must be string`);
      }
      if (schemaField.type === "number" && typeof value !== "number") {
        throw new Error(`${field} must be number`);
      }
      // Add more type checks if needed
      if (schemaField.validate) {
        schemaField.validate(value, field);
      }
    }
  });

  // Step 3: Apply updates using $set via DB instance
  await this.db.updateOne(
    { _id: id },
    { $set: updates }
  );

  // Step 4: Return merged updated user
  return { ...user, ...updates };
}
    
  }

  export default new UserModel();