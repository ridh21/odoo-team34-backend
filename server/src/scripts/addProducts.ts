import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function createDummyProductData() {
  try {
    // Step 1: Create a Farmer and Aadhaar Card
    const farmer = await prisma.farmers.create({
      data: {
        id: uuidv4(),
        name: "John Doe",
        location: "Village A, District B",
        status: "Active",
        age: 45,
        gender: "Male",
        adharCard: {
          create: {
            id: uuidv4(),
            adharNumber: "123456789012",
            name: "John Doe",
            address: "Village A, District B",
            gender: "Male",
          },
        },
      },
      include: {
        adharCard: true,
      },
    });

    console.log("Farmer created:", farmer);

    // Step 2: Create a Plot
    const plot = await prisma.plot.create({
      data: {
        id: uuidv4(),
        season: "Rabi", // Assuming this is an ENUM value
        area: 10.5,
      },
    });

    console.log("Plot created:", plot);

    // Step 3: Create Farmer Land
    const farmerLand = await prisma.farmerLand.create({
      data: {
        id: uuidv4(),
        totalArea: 10.5,
        irrigationMethod: "Drip", // Assuming this is an ENUM value
        soilType: "Loamy", // Assuming this is an ENUM value
      },
    });

    console.log("Farmer Land created:", farmerLand);

    // Step 4: Create a Crop
    const crop = await prisma.crop.create({
      data: {
        id: uuidv4(),
        farmerUUID: farmer.id,
        season: "Rabi", // Assuming this is an ENUM value
        cropName: "Wheat",
        area: 10.5,
        fertilizersUsed: "Urea, DAP",
        chemicalsUsed: "Pesticide A",
      },
    });

    console.log("Crop created:", crop);

    // Step 5: Create a PGS Certificate
    const pgsCertificate = await prisma.pGSCertificate.create({
      data: {
        id: uuidv4(),
        adharUUID: farmer.adharCard.id,
        certificateNumber: "PGS123456",
        dateOfIssue: new Date(),
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        authorizationNo: "AUTH123",
        plantationDate: new Date(),
        pruningDate: new Date(),
        cropUUID: crop.id,
        farmerLandUUID: farmerLand.id,
        plotUUID: plot.id,
      },
    });

    console.log("PGS Certificate created:", pgsCertificate);

    // Step 6: Create Quantity Details
    const quantityDetails = await prisma.quantity.create({
      data: {
        id: uuidv4(),
        category: "Standard", // Assuming this is an ENUM value
        productQuantity: 100.0,
        actualPrice: 500,
        discount: 10,
        discountedPrice: 450,
      },
    });

    console.log("Quantity Details created:", quantityDetails);

    // Step 7: Create a Product
    const product = await prisma.product.create({
      data: {
        productName: "Organic Wheat",
        farmerUUID: farmer.id,
        images: ["image1.jpg", "image2.jpg"],
        qrCodeString: "dummy-qr-code-string", // Replace with actual QR code generation logic if needed
        quantityDetailsUUID: quantityDetails.id,
        mspUUID: uuidv4(),
        isRefundable: true,
        returnDays: 7,
        exchangeDays: 14,
        cropMappings: {
          create: [
            {
              cropId: crop.id,
            },
          ],
        },
      },
      include: {
        farmer: true,
        cropMappings: true,
        quantityDetails: true,
      },
    });

    console.log("Product created:", product);
  } catch (error) {
    console.error("Error creating dummy product data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyProductData();