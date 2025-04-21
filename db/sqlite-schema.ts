import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

// SQLite 版本的表結構，功能與 PostgreSQL 版本相似但有些類型需要調整
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
  lastLogin: integer("last_login", { mode: "timestamp" }),
  role: text("role").default("user")
});

export const sharedResources = sqliteTable("shared_resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  resourceType: text("resource_type").notNull(),
  content: text("content", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  authorId: integer("author_id").notNull().references(() => users.id),
  isPublic: integer("is_public", { mode: "boolean" }).default(true)
});

export const collaborators = sqliteTable("collaborators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  resourceId: integer("resource_id").notNull().references(() => sharedResources.id),
  permissionLevel: text("permission_level").notNull().default("view"),
  addedAt: integer("added_at", { mode: "timestamp" }).notNull().default(new Date())
});

export const moodEntries = sqliteTable("mood_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  toolId: integer("tool_id").notNull(),
  mood: text("mood").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date())
});

export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  requirements: text("requirements", { mode: "json" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date())
});

export const userAchievements = sqliteTable("user_achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  earnedAt: integer("earned_at", { mode: "timestamp" }),
  progress: text("progress", { mode: "json" }).notNull(),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false)
});

export const errorLogs = sqliteTable("error_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  level: text("level").notNull(),
  message: text("message").notNull(),
  stack: text("stack"),
  metadata: text("metadata", { mode: "json" }),
  userId: integer("user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date())
});

export const systemMetrics = sqliteTable("system_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  value: text("value").notNull(),
  unit: text("unit").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().default(new Date())
});

export const toolUsageStats = sqliteTable("tool_usage_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  toolId: integer("tool_id").notNull().unique(),
  totalClicks: integer("total_clicks").notNull().default(0),
  categoryClicks: text("category_clicks", { mode: "json" }),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }).notNull().default(new Date())
});

export const visitorStats = sqliteTable("visitor_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  totalVisits: integer("total_visits").notNull().default(0),
  dailyVisits: text("daily_visits", { mode: "json" }).notNull(),
  lastVisitAt: integer("last_visit_at", { mode: "timestamp" })
});

export const seoAnalysisReports = sqliteTable("seo_analysis_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().default(new Date()),
  overallScore: integer("overall_score").notNull(),
  pageLoadTime: integer("page_load_time").notNull(),
  mobileScore: integer("mobile_score").notNull(),
  seoScore: integer("seo_score").notNull(),
  bestPracticesScore: integer("best_practices_score").notNull(),
  accessibilityScore: integer("accessibility_score").notNull(),
  details: text("details", { mode: "json" }).notNull()
});

export const seoMetrics = sqliteTable("seo_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: integer("report_id").notNull().references(() => seoAnalysisReports.id),
  metricName: text("metric_name").notNull(),
  metricValue: text("metric_value").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().default(new Date())
});

export const keywordRankings = sqliteTable("keyword_rankings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  keyword: text("keyword").notNull(),
  position: integer("position").notNull(),
  previousPosition: integer("previous_position"),
  url: text("url").notNull(),
  lastChecked: integer("last_checked", { mode: "timestamp" }).notNull().default(new Date()),
  searchVolume: integer("search_volume"),
  difficulty: integer("difficulty")
});