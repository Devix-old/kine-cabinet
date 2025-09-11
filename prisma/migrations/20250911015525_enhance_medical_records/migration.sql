-- AlterTable
ALTER TABLE "medical_records" ADD COLUMN     "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "diagnostic" TEXT,
ADD COLUMN     "examenPhysique" TEXT,
ADD COLUMN     "hypotheseClinique" TEXT,
ADD COLUMN     "imc" DECIMAL(65,30),
ADD COLUMN     "medecinResponsable" TEXT,
ADD COLUMN     "motifConsultation" TEXT,
ADD COLUMN     "notesLibres" TEXT,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "planSuivi" TEXT,
ADD COLUMN     "poids" DECIMAL(65,30),
ADD COLUMN     "resultatsLaboratoire" TEXT,
ADD COLUMN     "taille" DECIMAL(65,30),
ADD COLUMN     "tensionArterielle" TEXT,
ADD COLUMN     "traitementsPrescrits" TEXT,
ADD COLUMN     "typeConsultation" TEXT;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "antecedentsFamiliaux" TEXT,
ADD COLUMN     "assurance" TEXT,
ADD COLUMN     "habitudesVie" TEXT,
ADD COLUMN     "mutuelle" TEXT,
ADD COLUMN     "numeroSecuriteSociale" TEXT,
ADD COLUMN     "personneContact" TEXT,
ADD COLUMN     "telephoneUrgence" TEXT;

-- CreateTable
CREATE TABLE "examens_complementaires" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resultat" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "fichierUrl" TEXT,
    "notes" TEXT,
    "medicalRecordId" TEXT,
    "patientId" TEXT NOT NULL,
    "cabinetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examens_complementaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "nomMedicament" TEXT NOT NULL,
    "posologie" TEXT NOT NULL,
    "duree" TEXT,
    "instructions" TEXT,
    "type" TEXT NOT NULL DEFAULT 'MEDICAMENT',
    "medicalRecordId" TEXT,
    "patientId" TEXT NOT NULL,
    "cabinetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "examens_complementaires" ADD CONSTRAINT "examens_complementaires_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examens_complementaires" ADD CONSTRAINT "examens_complementaires_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examens_complementaires" ADD CONSTRAINT "examens_complementaires_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "cabinets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
