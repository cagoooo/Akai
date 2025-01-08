import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sharedResources = pgTable("shared_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  toolId: integer("tool_id").notNull(), 
  resourceType: text("resource_type").notNull(), 
  content: jsonb("content").notNull(), 
  creatorId: integer("creator_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const collaborators = pgTable("collaborators", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull().references(() => sharedResources.id),
  userId: integer("user_id").notNull().references(() => users.id),
  accessLevel: text("access_level").notNull(), 
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  toolId: integer("tool_id").notNull(),
  emoji: text("emoji").notNull(), 
  mood: text("mood").notNull(), 
  intensity: integer("intensity").notNull(), 
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), 
  category: text("category").notNull(), 
  requirements: jsonb("requirements").notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  progress: jsonb("progress").notNull(), 
});

export const usersRelations = relations(users, ({ many }) => ({
  createdResources: many(sharedResources),
  collaborations: many(collaborators),
  moodEntries: many(moodEntries),
  earnedAchievements: many(userAchievements),
}));

export const sharedResourcesRelations = relations(sharedResources, ({ one, many }) => ({
  creator: one(users, {
    fields: [sharedResources.creatorId],
    references: [users.id],
  }),
  collaborators: many(collaborators),
}));

export const collaboratorsRelations = relations(collaborators, ({ one }) => ({
  resource: one(sharedResources, {
    fields: [collaborators.resourceId],
    references: [sharedResources.id],
  }),
  user: one(users, {
    fields: [collaborators.userId],
    references: [users.id],
  }),
}));

export const moodEntriesRelations = relations(moodEntries, ({ one }) => ({
  user: one(users, {
    fields: [moodEntries.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const errorLogs = pgTable("error_logs", {
  id: serial("id").primaryKey(),
  level: text("level").notNull(), 
  message: text("message").notNull(),
  stack: text("stack"),
  metadata: jsonb("metadata"), 
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), 
  value: text("value").notNull(),
  unit: text("unit").notNull(), 
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const errorLogsRelations = relations(errorLogs, ({ one }) => ({
  user: one(users, {
    fields: [errorLogs.userId],
    references: [users.id],
  }),
}));

export const toolUsageStats = pgTable("tool_usage_stats", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").notNull(),
  totalClicks: integer("total_clicks").notNull().default(0),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
  categoryClicks: jsonb("category_clicks").notNull().default({
    communication: 0,
    teaching: 0,
    language: 0,
    reading: 0,
    utilities: 0,
    games: 0
  }),
});

export const visitorStats = pgTable("visitor_stats", {
  id: serial("id").primaryKey(),
  totalVisits: integer("total_visits").notNull().default(0),
  lastVisitAt: timestamp("last_visit_at").defaultNow().notNull(),
  dailyVisits: jsonb("daily_visits").notNull().default({}),
});

export const seoAnalysisReports = pgTable("seo_analysis_reports", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  overallScore: integer("overall_score").notNull(),
  pageLoadTime: integer("page_load_time").notNull(), // in milliseconds
  mobileScore: integer("mobile_score").notNull(),
  seoScore: integer("seo_score").notNull(),
  bestPracticesScore: integer("best_practices_score").notNull(),
  accessibilityScore: integer("accessibility_score").notNull(),
  details: jsonb("details").notNull(),
});

export const seoMetrics = pgTable("seo_metrics", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => seoAnalysisReports.id),
  metricName: text("metric_name").notNull(),
  metricValue: text("metric_value").notNull(),
  category: text("category").notNull(),
  importance: text("importance").notNull(),
  suggestions: jsonb("suggestions"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const keywordRankings = pgTable("keyword_rankings", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  position: integer("position"),
  previousPosition: integer("previous_position"),
  url: text("url").notNull(),
  lastChecked: timestamp("last_checked").defaultNow().notNull(),
  searchVolume: integer("search_volume"),
  difficulty: integer("difficulty"),
});

// Add relations
export const seoAnalysisReportsRelations = relations(seoAnalysisReports, ({ many }) => ({
  metrics: many(seoMetrics),
}));

export const seoMetricsRelations = relations(seoMetrics, ({ one }) => ({
  report: one(seoAnalysisReports, {
    fields: [seoMetrics.reportId],
    references: [seoAnalysisReports.id],
  }),
}));

// Add new schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertSharedResourceSchema = createInsertSchema(sharedResources);
export const selectSharedResourceSchema = createSelectSchema(sharedResources);
export const insertCollaboratorSchema = createInsertSchema(collaborators);
export const selectCollaboratorSchema = createSelectSchema(collaborators);
export const insertMoodEntrySchema = createInsertSchema(moodEntries);
export const selectMoodEntrySchema = createSelectSchema(moodEntries);
export const insertAchievementSchema = createInsertSchema(achievements);
export const selectAchievementSchema = createSelectSchema(achievements);
export const insertUserAchievementSchema = createInsertSchema(userAchievements);
export const selectUserAchievementSchema = createSelectSchema(userAchievements);
export const insertErrorLogSchema = createInsertSchema(errorLogs);
export const selectErrorLogSchema = createSelectSchema(errorLogs);
export const insertSystemMetricSchema = createInsertSchema(systemMetrics);
export const selectSystemMetricSchema = createSelectSchema(systemMetrics);
export const insertToolUsageStatsSchema = createInsertSchema(toolUsageStats);
export const selectToolUsageStatsSchema = createSelectSchema(toolUsageStats);
export const insertVisitorStatsSchema = createInsertSchema(visitorStats);
export const selectVisitorStatsSchema = createSelectSchema(visitorStats);
export const insertSeoAnalysisReportSchema = createInsertSchema(seoAnalysisReports);
export const selectSeoAnalysisReportSchema = createSelectSchema(seoAnalysisReports);
export const insertSeoMetricsSchema = createInsertSchema(seoMetrics);
export const selectSeoMetricsSchema = createSelectSchema(seoMetrics);
export const insertKeywordRankingSchema = createInsertSchema(keywordRankings);
export const selectKeywordRankingSchema = createSelectSchema(keywordRankings);

// Add new types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertSharedResource = typeof sharedResources.$inferInsert;
export type SelectSharedResource = typeof sharedResources.$inferSelect;
export type InsertCollaborator = typeof collaborators.$inferInsert;
export type SelectCollaborator = typeof collaborators.$inferSelect;
export type InsertMoodEntry = typeof moodEntries.$inferInsert;
export type SelectMoodEntry = typeof moodEntries.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type SelectAchievement = typeof achievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
export type SelectUserAchievement = typeof userAchievements.$inferSelect;
export type InsertErrorLog = typeof errorLogs.$inferInsert;
export type SelectErrorLog = typeof errorLogs.$inferSelect;
export type InsertSystemMetric = typeof systemMetrics.$inferInsert;
export type SelectSystemMetric = typeof systemMetrics.$inferSelect;
export type InsertToolUsageStats = typeof toolUsageStats.$inferInsert;
export type SelectToolUsageStats = typeof toolUsageStats.$inferSelect;
export type InsertVisitorStats = typeof visitorStats.$inferInsert;
export type SelectVisitorStats = typeof visitorStats.$inferSelect;
export type InsertSeoAnalysisReport = typeof seoAnalysisReports.$inferInsert;
export type SelectSeoAnalysisReport = typeof seoAnalysisReports.$inferSelect;
export type InsertSeoMetric = typeof seoMetrics.$inferInsert;
export type SelectSeoMetric = typeof seoMetrics.$inferSelect;
export type InsertKeywordRanking = typeof keywordRankings.$inferInsert;
export type SelectKeywordRanking = typeof keywordRankings.$inferSelect;