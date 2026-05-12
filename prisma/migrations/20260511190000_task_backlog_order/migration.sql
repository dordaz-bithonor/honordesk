-- AlterTable
ALTER TABLE "Task" ADD COLUMN "backlogOrder" INTEGER NOT NULL DEFAULT 0;

-- Orden inicial: más recientes arriba (coherente con el listado anterior por createdAt desc)
UPDATE "Task" AS t
SET "backlogOrder" = s.rn
FROM (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY "createdAt" DESC)) - 1 AS rn
  FROM "Task"
) AS s
WHERE t.id = s.id;
