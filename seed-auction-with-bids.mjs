import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users, products, auctions, bids } from "./drizzle/schema.ts";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ah_alpha",
});

const db = drizzle(connection);

console.log("🎯 Creating test auction with bidders...\n");

try {
  // Get an existing seller (first user)
  const sellers = await db.select().from(users).limit(1);
  if (sellers.length === 0) {
    console.error("❌ No seller found. Please create a user first.");
    process.exit(1);
  }
  const sellerId = sellers[0].id;

  // Get an existing product (first product)
  const products_list = await db.select().from(products).limit(1);
  if (products_list.length === 0) {
    console.error("❌ No product found. Please create a product first.");
    process.exit(1);
  }
  const productId = products_list[0].id;

  // Create test auction
  const auctionData = {
    productId: productId,
    sellerId: sellerId,
    startPrice: 100000,
    currentHighestBid: 350000,
    startTime: new Date(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: "active",
  };

  const auctionResult = await db.insert(auctions).values(auctionData);
  const auctionId = auctionResult[0];

  console.log(`✅ Auction created with ID: ${auctionId}`);
  console.log(`   Product: ${products_list[0].name}`);
  console.log(`   Seller ID: ${sellerId}\n`);

  // Create test bids
  const testBids = [
    {
      auctionId: auctionId,
      bidderId: 2,
      bidAmount: 150000,
      status: "active",
    },
    {
      auctionId: auctionId,
      bidderId: 3,
      bidAmount: 250000,
      status: "active",
    },
    {
      auctionId: auctionId,
      bidderId: 4,
      bidAmount: 350000,
      status: "active",
    },
  ];

  console.log("📝 Adding test bids...");
  for (const bid of testBids) {
    await db.insert(bids).values(bid);
    console.log(`   ✓ Bid: ${bid.bidAmount.toLocaleString()} د.ع from bidder ${bid.bidderId}`);
  }

  console.log("\n✅ Test auction with bids created successfully!");
  console.log(`\n🎯 Auction Details:`);
  console.log(`   Auction ID: ${auctionId}`);
  console.log(`   Product: ${products_list[0].name}`);
  console.log(`   Start Price: 100,000 د.ع`);
  console.log(`   Current Highest Bid: 350,000 د.ع`);
  console.log(`   Total Bids: 3`);
  console.log(`\n📍 Visit: /auction/${auctionId}`);

} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}

process.exit(0);
