CREATE TABLE "users"."user_levels" (
	"id" integer PRIMARY KEY NOT NULL,
	"user_level_name" varchar NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_levels_user_level_name_unique" UNIQUE("user_level_name")
);
--> statement-breakpoint
CREATE TABLE "users"."user_referral_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"uses_remaining" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_referral_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users"."user_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_user" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "users"."users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users"."users" ADD COLUMN "username" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users"."users" ADD COLUMN "password" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users"."users" ADD COLUMN "is_email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users"."users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users"."users" ADD COLUMN "deactivated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users"."users" ADD COLUMN "id_level" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users"."user_tokens" ADD CONSTRAINT "user_tokens_id_user_users_id_fk" FOREIGN KEY ("id_user") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."users" ADD CONSTRAINT "users_id_level_user_levels_id_fk" FOREIGN KEY ("id_level") REFERENCES "users"."user_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");