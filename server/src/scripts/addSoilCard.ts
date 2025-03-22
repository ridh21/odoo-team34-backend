import { PrismaClient, SoilType, SoilPH, SoilEC, NutrientLevel, NutrientSufficiency } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Aadhaar and Soil Card data...");

  // Fetch Aadhaar records with their IDs
  const aadhaars = await prisma.adharCard.findMany();

  // Soil data options
  const soilTypes: SoilType[] = ["Black", "Red"];
  const soilPHLevels: SoilPH[] = ["Acidic", "Basic", "Neutral"];
  const soilECLevels: SoilEC[] = ["Normal", "Abnormal"];
  const nutrientLevels: NutrientLevel[] = ["Low", "Medium", "High"];
  const nutrientSufficiency: NutrientSufficiency[] = ["Sufficient", "Insufficient"];

  function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getRandomDateInFuture(): Date {
    const now = new Date();
    return new Date(now.setFullYear(now.getFullYear() + 1)); // 1 year from now
  }

  // Seed Soil Cards linked to Aadhaar IDs
  await prisma.soilHealthCard.createMany({
    data: aadhaars.map((aadhaar) => ({
      id: uuidv4(),
      adharUUID: aadhaar.id, // Ensure this field exists in your Aadhaar model
      expirationDate: getRandomDateInFuture(),
      type: getRandomElement(soilTypes),
      pH: getRandomElement(soilPHLevels),
      ec: getRandomElement(soilECLevels),
      organicCarbon: getRandomElement(nutrientLevels),
      availableNitrogen: getRandomElement(nutrientLevels),
      availablePhosphorus: getRandomElement(nutrientLevels),
      availablePotassium: getRandomElement(nutrientLevels),
      availableSulphur: getRandomElement(nutrientSufficiency),
      availableZinc: getRandomElement(nutrientSufficiency),
      availableBoron: getRandomElement(nutrientSufficiency),
      availableIron: getRandomElement(nutrientSufficiency),
      availableManganese: getRandomElement(nutrientSufficiency),
      availableCopper: getRandomElement(nutrientSufficiency),
    })),
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });