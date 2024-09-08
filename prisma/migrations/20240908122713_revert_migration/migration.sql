/*
  Warnings:

  - Added the required column `nama` to the `TestMyModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestMyModel" ADD COLUMN     "nama" TEXT NOT NULL;
