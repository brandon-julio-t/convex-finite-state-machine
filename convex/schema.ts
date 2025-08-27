import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  contacts: defineTable({
    name: v.string(),
    /** floating status string, to model the chaos of the real world */
    status: v.string(),
    updatedAt: v.string(),
  }),

  contactNotificationLogs: defineTable({
    contactId: v.id("contacts"),
    fromStatus: v.string(),
    toStatus: v.string(),
    message: v.string(),
    sentAt: v.string(),
  }).index("by_contact_id", ["contactId"]),

  contactStatusUpdateNotificationEffects: defineTable({
    /** The status that will trigger this effect to run */
    triggerStatus: v.string(),
    /** The next status after the notification has been sent */
    nextStatus: v.string(),
    /** How many days before the notification is sent */
    daysDelay: v.number(),
    /** The message that will be sent to the user */
    message: v.string(),
  }).index("by_trigger_status", ["triggerStatus"]),
});
