import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode"; // Install this package using `npm install qrcode`

const prisma = new PrismaClient();

export const createProduct = async (req: Request, res: Response) => {
    try {
      const {
        productName,
        farmerUUID,
        images,
        quantityDetailsUUID,
        mspUUID,
        isRefundable,
        returnDays,
        exchangeDays,
        cropIds,
      } = req.body;
  
      if (!productName || !farmerUUID || !images || !cropIds || !cropIds.length) {
        return res.status(400).json({
          message: "Product name, farmer ID, images, and at least one crop ID are required",
        });
      }
  
      // Step 1: Find Aadhaar card details of the farmer
      const farmer = await prisma.farmers.findUnique({
        where: { id: farmerUUID },
        include: {
          adharCard: true, // Include Aadhaar card details
        },
      });
  
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }
  
      if (!farmer.adharCard) {
        return res.status(404).json({ message: "Aadhaar card details not found for the farmer" });
      }
  
      // Step 2: Find PGS certificate linked with the Aadhaar card
      const PGSdata = await prisma.pGSCertificate.findFirst({
        where: { adharUUID: farmer.adharCard.id },
        include: {
          crop: true, // Include crop details
        },
      });
  
      if (!PGSdata) {
        return res.status(404).json({ message: "PGS certificate not linked with the farmer's Aadhaar card" });
      }
  
      // Step 3: Generate QR code details
      const qrCodeData = {
        pruningDate: PGSdata.pruningDate?.toISOString() || "N/A",
        season: PGSdata.crop?.season || "N/A", // Fetch season from the Crop table
        cropArea: PGSdata.crop?.area || "N/A", // Fetch crop area from the Crop table
        fertilizersUsed: PGSdata.crop?.fertilizersUsed || "N/A", // Fetch fertilizers used from the Crop table
        chemicalsUsed: PGSdata.crop?.chemicalsUsed || "N/A", // Fetch chemicals used from the Crop table
        certificateNumber: PGSdata.certificateNumber || "N/A", // Fetch certificate number from the PGSCertificate table
        certificateExpirationDate: PGSdata.expiryDate?.toISOString() || "N/A",
        certificationAuthorizationNumber: PGSdata.authorizationNo || "N/A",
        memberName: farmer.adharCard.name || "N/A",
        farmerAddress: farmer.adharCard.address || "N/A",
        farmerGender: farmer.adharCard.gender || "N/A",
      };
  
      const qrCodeString = await QRCode.toDataURL(JSON.stringify(qrCodeData));
  
      // Step 4: Create the product
      const product = await prisma.product.create({
        data: {
          productName,
          farmerUUID,
          images,
          qrCodeString,
          quantityDetailsUUID,
          mspUUID,
          isRefundable: isRefundable || false,
          returnDays,
          exchangeDays,
          cropMappings: {
            create: cropIds.map((cropId: string) => ({
              cropId,
            })),
          },
        },
        include: {
          farmer: {
            include: {
              adharCard: true,
            },
          },
          quantityDetails: true,
          msp: true,
          cropMappings: {
            include: {
              crop: true,
            },
          },
        },
      });
  
      res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({
        message: "Error creating product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };