import mongoose from "mongoose";

/** Clears state that the seed keeps (rate limits, messages) so every run starts clean. */
export default async function globalSetup() {
  const uri = process.env.E2E_MONGODB_URI ?? "mongodb://127.0.0.1:27017/najeeb_portfolio_test";
  if (!/_test\b|test/i.test(uri)) throw new Error(`Refusing to clean a non-test database: ${uri}`);
  const conn = await mongoose.createConnection(uri).asPromise();
  await Promise.all([conn.collection("ratelimits").deleteMany({}), conn.collection("messages").deleteMany({}), conn.collection("playclicks").deleteMany({})]);
  await conn.close();
}
