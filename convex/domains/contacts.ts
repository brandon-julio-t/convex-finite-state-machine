import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "../_generated/server";
import { retrier } from "..";

export const getContacts = query({
  args: {},
  handler: async (ctx) => {
    const contacts = await ctx.db.query("contacts").order("desc").collect();

    return await Promise.all(
      contacts.map(async (contact) => {
        const contactNotificationLogs = await ctx.db
          .query("contactNotificationLogs")
          .withIndex("by_contact_id", (q) => q.eq("contactId", contact._id))
          .order("desc")
          .collect();

        return {
          ...contact,
          contactNotificationLogs,
        };
      }),
    );
  },
});

export const getContactById = query({
  args: {
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contactId);
  },
});

export const updateContactStatus = mutation({
  args: {
    contactId: v.id("contacts"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      console.log("contact not found", args.contactId);
      return;
    }

    await ctx.db.patch(args.contactId, {
      status: args.status,
    });

    const effects = await ctx.db
      .query("contactStatusUpdateNotificationEffects")
      .withIndex("by_trigger_status", (q) => q.eq("triggerStatus", args.status))
      .collect();

    for (const effect of effects) {
      console.log("effect", effect);

      if (effect) {
        const jobId = await retrier.runAfter(
          ctx,
          // effect.daysDelay * 24 * 60 * 60 * 1000,
          effect.daysDelay * 1000,
          internal.domains.contacts.handleUpdateContactStatusNotificationEffect,
          {
            contactId: args.contactId,

            triggerStatus: effect.triggerStatus,
            nextStatus: effect.nextStatus,
            message: effect.message,
            daysDelay: effect.daysDelay,
          },
        );

        console.log("scheduled jobId", jobId);
      }
    }
  },
});

export const handleUpdateContactStatusNotificationEffect = internalAction({
  args: {
    contactId: v.id("contacts"),
    triggerStatus: v.string(),
    nextStatus: v.string(),
    message: v.string(),
    daysDelay: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const contact = await ctx.runQuery(api.domains.contacts.getContactById, {
      contactId: args.contactId,
    });

    if (!contact) {
      console.log("contact not found", args.contactId);
      return;
    }

    if (contact.status !== args.triggerStatus) {
      console.log("contact status does not match trigger status", {
        contact,
        triggerStatus: args.triggerStatus,
        nextStatus: args.nextStatus,
        message: args.message,
        daysDelay: args.daysDelay,
      });
      return;
    }

    console.log("sending notification");

    // Simulate sending notification
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("notification sent");

    if (args.nextStatus) {
      await ctx.runMutation(api.domains.contacts.updateContactStatus, {
        contactId: args.contactId,
        status: args.nextStatus,
      });
    }

    await ctx.runMutation(
      internal.domains.contacts.appendContactNotificationLog,
      {
        contactId: args.contactId,
        fromStatus: args.triggerStatus,
        toStatus: args.nextStatus,
        message: args.message,
      },
    );
  },
});

export const appendContactNotificationLog = internalMutation({
  args: {
    contactId: v.id("contacts"),
    fromStatus: v.string(),
    toStatus: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("contactNotificationLogs", {
      contactId: args.contactId,
      fromStatus: args.fromStatus,
      toStatus: args.toStatus,
      message: args.message,
      sentAt: new Date().toISOString(),
    });
  },
});
