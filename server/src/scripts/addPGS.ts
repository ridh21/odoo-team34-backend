import { PrismaClient, PGSCertificateType, FarmerStatus, IrrigationMethod, LandOwnership, Season } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed PGS Certificate data for all AdharCard users...');

  // Fetch all existing AdharCards
  const existingAdharCards = await prisma.adharCard.findMany();
  
  if (existingAdharCards.length === 0) {
    throw new Error('No AdharCards found in the database. Please create AdharCard entries first.');
  }
  
  console.log(`Found ${existingAdharCards.length} AdharCards. Creating data for each...`);

  // Process each AdharCard
  for (const adharCard of existingAdharCards) {
    console.log(`\nProcessing AdharCard: ${adharCard.id} (${adharCard.name})`);
    
    // Check if this AdharCard already has a PGS Certificate
    const existingPGSCert = await prisma.pGSCertificate.findFirst({
      where: { adharUUID: adharCard.id }
    });
    
    if (existingPGSCert) {
      console.log(`AdharCard ${adharCard.id} already has a PGS Certificate. Skipping...`);
      continue;
    }

    // Check if SoilHealthCard exists for this AdharCard
    let soilHealthCard = await prisma.soilHealthCard.findFirst({
      where: { adharUUID: adharCard.id }
    });
    
    if (!soilHealthCard) {
      console.log(`No SoilHealthCard found for AdharCard ${adharCard.id}. Skipping...`);
      continue;
    }

    // Create a temporary farmer for the crop if one doesn't exist
    let farmer = await prisma.farmers.findFirst({
      where: { adharUUID: adharCard.id }
    });
    
    if (!farmer) {
      farmer = await prisma.farmers.create({
        data: {
          adharUUID: adharCard.id,
          password: 'temporary_password_to_be_changed', // This should be changed when a real farmer registers
        }
      });
      console.log(`Created temporary farmer: ${farmer.id}`);
    } else {
      console.log(`Using existing farmer: ${farmer.id}`);
    }

    // Create FarmerLand
    const farmerLand = await prisma.farmerLand.create({
      data: {
        totalArea: 5.5 + Math.random() * 5, // Random area between 5.5 and 10.5
        organicArea: 3.2 + Math.random() * 2, // Random organic area between 3.2 and 5.2
        landOwnership: Math.random() > 0.5 ? LandOwnership.Own : LandOwnership.Rented,
        totalPlots: Math.floor(1 + Math.random() * 4) // Random number of plots between 1 and 4
      }
    });
    console.log(`Created FarmerLand: ${farmerLand.id}`);

    // Create Plot
    const plot = await prisma.plot.create({
      data: {
        khasraNumber: `KH${Math.floor(10000 + Math.random() * 90000)}`, // Random 5-digit khasra number
        latitude: 12.9716 + (Math.random() - 0.5) * 2, // Random latitude around 12.9716
        longitude: 77.5946 + (Math.random() - 0.5) * 2 // Random longitude around 77.5946
      }
    });
    console.log(`Created Plot: ${plot.id}`);

    // Create MSP
    const cropNames = ['Organic Rice', 'Organic Wheat', 'Organic Millets', 'Organic Pulses', 'Organic Vegetables'];
    const randomCropName = cropNames[Math.floor(Math.random() * cropNames.length)];
    
    const msp = await prisma.mSP.create({
      data: {
        cropName: randomCropName,
        minimumSupportPrice: 1500 + Math.floor(Math.random() * 2000) // Random MSP between 1500 and 3500
      }
    });
    console.log(`Created MSP for ${randomCropName}: ${msp.id}`);

    // Create Crop
    const seasons = [Season.Rainy, Season.Rabi, Season.Summer];
    const randomSeason = seasons[Math.floor(Math.random() * seasons.length)];
    
    const crop = await prisma.crop.create({
      data: {
        farmerUUID: farmer.id,
        cropName: randomCropName,
        season: randomSeason,
        area: 1.5 + Math.random() * 3, // Random area between 1.5 and 4.5
        fertilizersUsed: 'Organic compost, vermicompost',
        chemicalsUsed: 'None',
        mspUUID: msp.id
      }
    });
    console.log(`Created Crop (${randomCropName}): ${crop.id}`);

    // Create PGS Certificate
    const certificateNumber = `PGS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`; // Random certificate number
    const memberCode = `MEM${Math.floor(1000 + Math.random() * 9000)}`; // Random member code
    const localGroupNumber = `LG${Math.floor(100 + Math.random() * 900)}`; // Random local group number
    
    const pgsCertificate = await prisma.pGSCertificate.create({
      data: {
        type: Math.random() > 0.3 ? PGSCertificateType.Individual_Farmer : PGSCertificateType.Local_Group,
        adharUUID: adharCard.id,
        bankAccountName: adharCard.name,
        bankAccountNumber: `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`, // Random 14-digit account number
        bankIFSCCode: `SBIN${Math.floor(10000 + Math.random() * 90000)}`, // Random IFSC code
        emailID: `${adharCard.name.toLowerCase().replace(/\s/g, '.')}@example.com`,
        certificateNumber: certificateNumber,
        dateOfIssue: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)), // Random date in the past year
        expiryDate: new Date(Date.now() + (2 + Math.floor(Math.random() * 3)) * 365 * 24 * 60 * 60 * 1000), // Random date 2-4 years in the future
        memberCode: memberCode,
        localGroupNumber: localGroupNumber,
        farmerStatus: Math.random() > 0.5 ? FarmerStatus.PGS_ORGANIC : FarmerStatus.PGS_GREEN,
        authorizationNo: `AUTH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, // Random authorization number
        farmerLandUUID: farmerLand.id,
        cropUUID: crop.id,
        plotUUID: plot.id,
        plantationDate: new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)), // Random date in the past 6 months
        pruningDate: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)), // Random date in the past 3 months
        isIrrigated: Math.random() > 0.3, // 70% chance of being irrigated
        irrigationMethod: Math.random() > 0.5 ? IrrigationMethod.Irrigation : IrrigationMethod.Rainfed
      }
    });
    console.log(`Created PGS Certificate: ${pgsCertificate.id}`);

    // Link everything in GovernmentData
    const governmentData = await prisma.governmentData.create({
      data: {
        adharUUID: adharCard.id,
        pgsCertificateUUID: pgsCertificate.id,
        soilHealthCardUUID: soilHealthCard.id
      }
    });
    console.log(`Created GovernmentData: ${governmentData.id}`);

    // Update FarmerLand with certificate reference
    await prisma.farmerLand.update({
      where: { id: farmerLand.id },
      data: { certificateUUID: pgsCertificate.id }
    });
    console.log(`Updated FarmerLand with certificate reference`);
  }

  console.log('\nSeeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
