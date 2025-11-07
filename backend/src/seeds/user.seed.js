import { config } from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";
import User from "../models/user.model.js";

config();

const BASE_URL = process.env.BACKEND_URL || "http://localhost:5001"; // 👈 backend URL fallback

const seed = [
  {
    email: "emma.thompson@example.com",
    fullName: "Emma Thompson",
    password: "1234567890",
    profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    email: "olivia.miller@example.com",
    fullName: "Olivia Miller",
    password: "1234567890",
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    email: "sophia.davis@example.com",
    fullName: "Sophia Davis",
    password: "1234567890",
    profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    email: "william.clark@example.com",
    fullName: "William Clark",
    password: "1234567890",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    email: "benjamin.taylon@example.com",
    fullName: "Benjamin Taylon",
    password: "1234567890",
    profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    email: "lucas.moore@example.com",
    fullName: "Lucas Moore",
    password: "1234567890",
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    email: "henry.jackson@example.com",
    fullName: "Henry Jackson",
    password: "1234567890",
    profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
  },
];

const downloadImage = async (url, filename) => {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, filename);

  // 🧱 Ensure uploads folder exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 🛑 Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`⚡ Skipping ${filename} (already exists)`);
    return `/uploads/${filename}`;
  }

  console.log(`⬇️ Downloading ${filename}...`);

  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      console.log(`✅ Saved ${filename}`);
      resolve(`/uploads/${filename}`);
    });
    writer.on("error", reject);
  });
};

const seedDatabase = async () => {
  try {
    const users = [];

    for (const user of seed) {
      const filename = `${user.fullName.replace(/\s+/g, "_").toLowerCase()}.jpg`;
      const localPath = await downloadImage(user.profilePic, filename);

      users.push({
        ...user,
        profilePic: `${BASE_URL}${localPath}`, // full backend URL
      });
    }

    await User.createMany(users);
    console.log("🎉 Database seeded successfully with local images!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error while seeding the database:", error);
    process.exit(1);
  }
};

seedDatabase();
