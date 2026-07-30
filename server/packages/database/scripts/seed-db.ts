import { db } from "../src/index.js";
import { userLevels, users } from "../src/schema/userSchema.js";

async function seed() {
  console.log("Seeding database...");
  
  try {
    const levels = [
      { id: 1, name: "user", description: "Standard user" },
      { id: 2, name: "admin", description: "Administrator" },
    ];
    
    for (const level of levels) {
      await db.insert(userLevels)
        .values(level)
        .onConflictDoNothing({ target: userLevels.id });
      console.log(`[\x1b[32m✓\x1b[0m] Successfully seeded user level: ${level.name}`);
    }

    const hashedPassword = await Bun.password.hash("password");
    await db.insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
        idLevel: 2,
        isActive: true,
        isEmailVerified: true,
      })
      .onConflictDoNothing({ target: users.username });
    console.log("[\x1b[32m✓\x1b[0m] Successfully seeded admin user");
    
    console.log("[\x1b[32m✓\x1b[0m] Database seeded successfully");
  } catch (error) {
    console.error("[\x1b[31m!\x1b[0m] Error seeding database:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

seed();
