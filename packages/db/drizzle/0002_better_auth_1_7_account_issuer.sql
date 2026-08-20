ALTER TABLE "account" ADD COLUMN "issuer" text;--> statement-breakpoint
UPDATE "account" SET "issuer" = 'https://accounts.google.com' WHERE "provider_id" = 'google' AND "issuer" IS NULL;--> statement-breakpoint
UPDATE "account" SET "issuer" = 'local:oauth:github' WHERE "provider_id" = 'github' AND "issuer" IS NULL;--> statement-breakpoint
UPDATE "account" SET "issuer" = 'local:oauth:' || "provider_id" WHERE "issuer" IS NULL;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account" USING btree ("issuer","account_id");
