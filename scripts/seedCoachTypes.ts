import { db } from "../server/db";
import { coachTypes } from "../shared/schema";

async function seedCoachTypes() {
  await db.insert(coachTypes).values([
    { name: "Class A" },
    { name: "Class B" },
    { name: "Class C" },
    { name: "Luxury" }
  ]).onConflictDoNothing();
  console.log("Seeded coach_types");
  process.exit(0);
}

seedCoachTypes().catch(console.error);