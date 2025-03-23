-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "FarmerStatus" AS ENUM ('PGS_GREEN', 'PGS_ORGANIC');

-- CreateEnum
CREATE TYPE "PGSCertificateType" AS ENUM ('Individual_Farmer', 'Local_Group');

-- CreateEnum
CREATE TYPE "IrrigationMethod" AS ENUM ('Irrigation', 'Rainfed');

-- CreateEnum
CREATE TYPE "LandOwnership" AS ENUM ('Rented', 'Own', 'Lease');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('Summer', 'Rainy', 'Rabi');

-- CreateEnum
CREATE TYPE "SoilType" AS ENUM ('Black', 'Red');

-- CreateEnum
CREATE TYPE "SoilPH" AS ENUM ('Acidic', 'Basic', 'Neutral');

-- CreateEnum
CREATE TYPE "SoilEC" AS ENUM ('Normal', 'Abnormal');

-- CreateEnum
CREATE TYPE "NutrientLevel" AS ENUM ('Low', 'Medium', 'High');

-- CreateEnum
CREATE TYPE "NutrientSufficiency" AS ENUM ('Sufficient', 'Insufficient');

-- CreateEnum
CREATE TYPE "QuantityCategory" AS ENUM ('Standard', 'Sample', 'Bulk');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'Card', 'Net_Banking', 'Wallet');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('Processing', 'Completed', 'Failed');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Debit', 'Credit', 'Refund');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('Pending', 'Success', 'Failed');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "governmentEmailID" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farmers" (
    "id" TEXT NOT NULL,
    "adharUUID" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "otp" TEXT,
    "otpExpiry" TIMESTAMP(3),

    CONSTRAINT "Farmers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "emailID" TEXT,
    "mobileNumber" TEXT,
    "password" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "state" TEXT,
    "city" TEXT,
    "pincode" TEXT,
    "otp" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "coins" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernmentData" (
    "id" TEXT NOT NULL,
    "adharUUID" TEXT NOT NULL,
    "pgsCertificateUUID" TEXT,
    "soilHealthCardUUID" TEXT,

    CONSTRAINT "GovernmentData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PGSCertificate" (
    "id" TEXT NOT NULL,
    "type" "PGSCertificateType" NOT NULL,
    "adharUUID" TEXT NOT NULL,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankIFSCCode" TEXT,
    "emailID" TEXT,
    "certificateNumber" TEXT,
    "dateOfIssue" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "memberCode" TEXT,
    "localGroupNumber" TEXT,
    "farmerStatus" "FarmerStatus",
    "authorizationNo" TEXT,
    "farmerLandUUID" TEXT,
    "cropUUID" TEXT,
    "plotUUID" TEXT,
    "plantationDate" TIMESTAMP(3),
    "pruningDate" TIMESTAMP(3),
    "isIrrigated" BOOLEAN,
    "irrigationMethod" "IrrigationMethod",

    CONSTRAINT "PGSCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmerLand" (
    "id" TEXT NOT NULL,
    "certificateUUID" TEXT,
    "totalArea" DOUBLE PRECISION,
    "organicArea" DOUBLE PRECISION,
    "landOwnership" "LandOwnership",
    "totalPlots" INTEGER,

    CONSTRAINT "FarmerLand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plot" (
    "id" TEXT NOT NULL,
    "khasraNumber" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "Plot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "farmerUUID" TEXT NOT NULL,
    "season" "Season",
    "cropName" TEXT NOT NULL,
    "area" DOUBLE PRECISION,
    "fertilizersUsed" TEXT,
    "chemicalsUsed" TEXT,
    "mspUUID" TEXT,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilHealthCard" (
    "id" TEXT NOT NULL,
    "adharUUID" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "type" "SoilType",
    "pH" "SoilPH",
    "ec" "SoilEC",
    "organicCarbon" "NutrientLevel",
    "availableNitrogen" "NutrientLevel",
    "availablePhosphorus" "NutrientLevel",
    "availablePotassium" "NutrientLevel",
    "availableSulphur" "NutrientSufficiency",
    "availableZinc" "NutrientSufficiency",
    "availableBoron" "NutrientSufficiency",
    "availableIron" "NutrientSufficiency",
    "availableManganese" "NutrientSufficiency",
    "availableCopper" "NutrientSufficiency",

    CONSTRAINT "SoilHealthCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdharCard" (
    "id" TEXT NOT NULL,
    "adharNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobileNumber" TEXT,
    "dob" TIMESTAMP(3),
    "gender" "Gender",
    "address" TEXT,

    CONSTRAINT "AdharCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MSP" (
    "id" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "minimumSupportPrice" INTEGER NOT NULL,

    CONSTRAINT "MSP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "farmerUUID" TEXT NOT NULL,
    "images" TEXT[],
    "qrCodeString" TEXT,
    "quantityDetailsUUID" TEXT,
    "mspUUID" TEXT,
    "isRefundable" BOOLEAN NOT NULL DEFAULT false,
    "returnDays" INTEGER,
    "exchangeDays" INTEGER,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCropMapping" (
    "id" TEXT NOT NULL,
    "productUUID" TEXT NOT NULL,
    "cropUUID" TEXT NOT NULL,

    CONSTRAINT "ProductCropMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quantity" (
    "id" TEXT NOT NULL,
    "category" "QuantityCategory",
    "productQuantity" DOUBLE PRECISION,
    "actualPrice" INTEGER,
    "discount" INTEGER,
    "discountedPrice" INTEGER,

    CONSTRAINT "Quantity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userUUID" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'Pending',
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'Pending',
    "razorpayOrderID" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "earnedCoins" INTEGER,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderUUID" TEXT NOT NULL,
    "razorpayPaymentID" TEXT,
    "amountPaid" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod",
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usedCoins" INTEGER,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "paymentUUID" TEXT NOT NULL,
    "razorpayRefundID" TEXT,
    "refundAmount" DOUBLE PRECISION NOT NULL,
    "refundStatus" "RefundStatus" NOT NULL DEFAULT 'Processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userUUID" TEXT NOT NULL,
    "paymentUUID" TEXT,
    "transactionType" "TransactionType" NOT NULL,
    "transactionAmount" INTEGER NOT NULL,
    "transactionStatus" "TransactionStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Farmers_adharUUID_key" ON "Farmers"("adharUUID");

-- CreateIndex
CREATE UNIQUE INDEX "Users_emailID_key" ON "Users"("emailID");

-- CreateIndex
CREATE UNIQUE INDEX "Users_mobileNumber_key" ON "Users"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PGSCertificate_certificateNumber_key" ON "PGSCertificate"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AdharCard_adharNumber_key" ON "AdharCard"("adharNumber");

-- AddForeignKey
ALTER TABLE "Farmers" ADD CONSTRAINT "Farmers_adharUUID_fkey" FOREIGN KEY ("adharUUID") REFERENCES "AdharCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentData" ADD CONSTRAINT "GovernmentData_adharUUID_fkey" FOREIGN KEY ("adharUUID") REFERENCES "AdharCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentData" ADD CONSTRAINT "GovernmentData_pgsCertificateUUID_fkey" FOREIGN KEY ("pgsCertificateUUID") REFERENCES "PGSCertificate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentData" ADD CONSTRAINT "GovernmentData_soilHealthCardUUID_fkey" FOREIGN KEY ("soilHealthCardUUID") REFERENCES "SoilHealthCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGSCertificate" ADD CONSTRAINT "PGSCertificate_adharUUID_fkey" FOREIGN KEY ("adharUUID") REFERENCES "AdharCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGSCertificate" ADD CONSTRAINT "PGSCertificate_farmerLandUUID_fkey" FOREIGN KEY ("farmerLandUUID") REFERENCES "FarmerLand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGSCertificate" ADD CONSTRAINT "PGSCertificate_cropUUID_fkey" FOREIGN KEY ("cropUUID") REFERENCES "Crop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGSCertificate" ADD CONSTRAINT "PGSCertificate_plotUUID_fkey" FOREIGN KEY ("plotUUID") REFERENCES "Plot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_farmerUUID_fkey" FOREIGN KEY ("farmerUUID") REFERENCES "Farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_mspUUID_fkey" FOREIGN KEY ("mspUUID") REFERENCES "MSP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilHealthCard" ADD CONSTRAINT "SoilHealthCard_adharUUID_fkey" FOREIGN KEY ("adharUUID") REFERENCES "AdharCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_farmerUUID_fkey" FOREIGN KEY ("farmerUUID") REFERENCES "Farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_quantityDetailsUUID_fkey" FOREIGN KEY ("quantityDetailsUUID") REFERENCES "Quantity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_mspUUID_fkey" FOREIGN KEY ("mspUUID") REFERENCES "MSP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCropMapping" ADD CONSTRAINT "ProductCropMapping_productUUID_fkey" FOREIGN KEY ("productUUID") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCropMapping" ADD CONSTRAINT "ProductCropMapping_cropUUID_fkey" FOREIGN KEY ("cropUUID") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userUUID_fkey" FOREIGN KEY ("userUUID") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderUUID_fkey" FOREIGN KEY ("orderUUID") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentUUID_fkey" FOREIGN KEY ("paymentUUID") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userUUID_fkey" FOREIGN KEY ("userUUID") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentUUID_fkey" FOREIGN KEY ("paymentUUID") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
