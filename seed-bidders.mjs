import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users, auctions, bids } from "./drizzle/schema.ts";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ah_alpha",
});

const db = drizzle(connection);

// Test bidder data with profile pictures
const testBidders = [
  {
    openId: "bidder_1_" + Date.now(),
    name: "أحمد محمد",
    email: "ahmed@example.com",
    userType: "buyer",
    balance: 5000000,
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
  },
  {
    openId: "bidder_2_" + Date.now(),
    name: "فاطمة علي",
    email: "fatima@example.com",
    userType: "buyer",
    balance: 3000000,
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
  },
  {
    openId: "bidder_3_" + Date.now(),
    name: "محمود حسن",
    email: "mahmoud@example.com",
    userType: "buyer",
    balance: 4500000,
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mahmoud",
  },
  {
    openId: "bidder_4_" + Date.now(),
    name: "ليلى إبراهيم",
    email: "layla@example.com",
    userType: "buyer",
    balance: 2500000,
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Layla",
  },
  {
    openId: "bidder_5_" + Date.now(),
    name: "سارة خالد",
    email: "sarah@example.com",
    userType: "buyer",
    balance: 6000000,
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
];

// Insert test bidders
console.log("📝 Inserting test bidders...");
for (const bidder of testBidders) {
  await db.insert(users).values({
    ...bidder,
    role: "user",
  }).catch(err => {
    if (err.code !== "ER_DUP_ENTRY") {
      console.error("Error inserting bidder:", err);
    }
  });
}

console.log("✅ Test bidders created successfully!");
console.log("\nBidders created:");
testBidders.forEach(b => {
  console.log(`- ${b.name} (${b.email})`);
});

process.exit(0);
