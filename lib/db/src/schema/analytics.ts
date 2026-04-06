import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analyticsEventsTable = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  event_type: text("event_type").notNull(),
  visitor_id: text("visitor_id").notNull(),
  session_id: text("session_id").notNull(),
  subject: text("subject"),
  is_correct: boolean("is_correct"),
  topic: text("topic"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEventsTable).omit({ id: true, created_at: true });
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEventsTable.$inferSelect;

export const analyticsOnlineTable = pgTable("analytics_online", {
  id: serial("id").primaryKey(),
  visitor_id: text("visitor_id").notNull().unique(),
  session_id: text("session_id").notNull(),
  last_seen: timestamp("last_seen").defaultNow().notNull(),
  page: text("page"),
});

export const insertAnalyticsOnlineSchema = createInsertSchema(analyticsOnlineTable).omit({ id: true });
export type InsertAnalyticsOnline = z.infer<typeof insertAnalyticsOnlineSchema>;
