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

export const usersRelations = relations(users, ({ many }) => ({
  createdResources: many(sharedResources),
  collaborations: many(collaborators),
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

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertSharedResourceSchema = createInsertSchema(sharedResources);
export const selectSharedResourceSchema = createSelectSchema(sharedResources);
export const insertCollaboratorSchema = createInsertSchema(collaborators);
export const selectCollaboratorSchema = createSelectSchema(collaborators);

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertSharedResource = typeof sharedResources.$inferInsert;
export type SelectSharedResource = typeof sharedResources.$inferSelect;
export type InsertCollaborator = typeof collaborators.$inferInsert;
export type SelectCollaborator = typeof collaborators.$inferSelect;