-- CreateEnum
CREATE TYPE "MachinesStatus" AS ENUM ('ACTIVE', 'IDLE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "MACHINE_TYPE" AS ENUM ('CNC', 'HYDRAULIC', 'FURNACE', 'ROBOTIC_ARM');

-- CreateTable
CREATE TABLE "Machines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "status" "MachinesStatus" NOT NULL DEFAULT 'ACTIVE',
    "type" "MACHINE_TYPE" NOT NULL,
    "temperature_max" DOUBLE PRECISION NOT NULL,
    "vibration_max" DOUBLE PRECISION NOT NULL,
    "power_max" DOUBLE PRECISION NOT NULL,
    "thresholds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Machines_pkey" PRIMARY KEY ("id")
);
