ALTER TABLE "revetalhagenmk2_booking" ADD COLUMN "isPaid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "revetalhagenmk2_booking" ADD COLUMN "paidAt" timestamp with time zone;