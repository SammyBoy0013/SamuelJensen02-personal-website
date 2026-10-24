CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"date" date NOT NULL,
	"name" jsonb NOT NULL,
	"place" jsonb,
	"confirmed" boolean DEFAULT false NOT NULL,
	"check_fields" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"page" text NOT NULL,
	"key" text NOT NULL,
	"locale" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education" (
	"id" serial PRIMARY KEY NOT NULL,
	"page" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"years" jsonb,
	"text" jsonb NOT NULL,
	"check_fields" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"blob_url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"dominant_colour" text NOT NULL,
	"alt_en" text NOT NULL,
	"alt_da" text,
	"alt_fr" text,
	"credit" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"category" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "glance_rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"page" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"label" jsonb NOT NULL,
	"value" jsonb NOT NULL,
	"check_fields" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"when_label" jsonb NOT NULL,
	"text" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "golf_bag" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"club" jsonb NOT NULL,
	"make_model" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "golf_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"date" date,
	"year_label" text,
	"event" jsonb NOT NULL,
	"course" jsonb,
	"format" jsonb,
	"score" integer,
	"to_par" integer,
	"placing" jsonb,
	"check_fields" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "golf_rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"date" date,
	"course" text NOT NULL,
	"score" integer NOT NULL,
	"to_par" integer,
	"fairways_hit" integer,
	"fairways_total" integer,
	"gir" integer,
	"putts" integer,
	"sg_putting" real,
	"dispersion_m" real,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"names" jsonb NOT NULL,
	"level" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_bests" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metric" jsonb NOT NULL,
	"value_ms" integer,
	"value_m" integer,
	"watts" integer,
	"date" date,
	"note" jsonb,
	"check_fields" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"years" jsonb,
	"text" jsonb NOT NULL,
	"check_fields" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"blob_url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"dominant_colour" text NOT NULL,
	"alt_en" text NOT NULL,
	"alt_da" text,
	"alt_fr" text,
	"credit" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"category" text DEFAULT 'project' NOT NULL,
	"approved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "races" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"date" date,
	"date_label" text,
	"regatta" jsonb NOT NULL,
	"place" jsonb,
	"event" jsonb,
	"boat_class" text,
	"crew" text[] DEFAULT '{}'::text[] NOT NULL,
	"round" jsonb,
	"placing" jsonb,
	"time_ms" integer,
	"story_key" text,
	"confirmed" boolean DEFAULT true NOT NULL,
	"check_fields" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"area" jsonb NOT NULL,
	"skills" jsonb,
	"check_fields" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"year" text NOT NULL,
	"text" jsonb NOT NULL,
	"check_fields" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"external_id" text NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"sport" text NOT NULL,
	"title" text,
	"duration_s" integer NOT NULL,
	"distance_m" integer,
	"avg_split_s_per_500" real,
	"avg_rate" real,
	"avg_hr" integer,
	"max_hr" integer,
	"avg_watts" integer,
	"visible" boolean DEFAULT true NOT NULL,
	"auto_hidden_reason" text
);
--> statement-breakpoint
CREATE TABLE "work" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"years" jsonb,
	"text" jsonb NOT NULL,
	"check_fields" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "content_blocks_page_key_locale" ON "content_blocks" USING btree ("page","key","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "training_sessions_source_external_id" ON "training_sessions" USING btree ("source","external_id");