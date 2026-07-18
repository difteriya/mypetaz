-- Visit record carries the health-record type it maps to on approve (§7.3).
ALTER TABLE "vet_visit_records" ADD COLUMN "recordType" "HealthRecordType" NOT NULL DEFAULT 'EXAM';
