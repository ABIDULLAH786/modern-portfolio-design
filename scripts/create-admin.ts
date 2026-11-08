/** pnpm create-admin → creates or resets the single admin user from ADMIN_EMAIL / ADMIN_PASSWORD. */
import "./_env";
import bcrypt from "bcryptjs";
import { connectDb, disconnectDb } from "@/server/db";
import { User } from "@/server/models";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Set ADMIN_EMAIL in .env.local (a valid email).");
  if (password.length < 10) throw new Error("Set ADMIN_PASSWORD in .env.local (at least 10 characters).");

  await connectDb();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await User.findOne();
  if (existing) {
    existing.email = email;
    existing.passwordHash = passwordHash;
    existing.failedLogins = { count: 0, lockedUntil: null };
    existing.sessionVersion = (existing.sessionVersion ?? 1) + 1; // log out other devices
    existing.passwordChangedAt = null;
    await existing.save();
    console.log(`✔ Admin user updated: ${email} (all other sessions were logged out)`);
  } else {
    await User.create({ email, passwordHash, name: "Najeeb" });
    console.log(`✔ Admin user created: ${email}`);
  }
  console.log("Remember to remove ADMIN_PASSWORD from your env file now.");
}

main()
  .catch((e) => {
    console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());
