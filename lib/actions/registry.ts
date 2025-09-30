import { z } from "zod";
import { AnyActionDefinition, ActionCategory, ActionContext, ActionResult } from "./types";
import { GHLConversationsService } from "@/lib/services/ghlConversationsService";
import { GHLContactsService } from "@/lib/services/ghlContactsService";
import { GHLOpportunitiesService } from "@/lib/services/ghlOpportunitiesService";

const stubExecute = async (): Promise<{ status: "failed"; error: { message: string } }> => ({
  status: "failed",
  error: { message: "Not implemented" },
});

function requireGhl(ctx: ActionContext): { token: string; locationId: string } | ActionResult {
  if (!ctx.ghlAccessToken) return { status: "failed", error: { message: "Missing GHL access token" } };
  if (!ctx.locationId) return { status: "failed", error: { message: "Missing GHL location id" } };
  return { token: ctx.ghlAccessToken, locationId: ctx.locationId } as any;
}

export const ACTIONS: AnyActionDefinition[] = [
  // Attract (supported via Trigger Links, Blogs)
  {
    id: "attract.createTriggerLink",
    title: "Create Trigger Link",
    description: "Create a new tracking/trigger link",
    category: "Attract",
    icon: "Link",
    inputSchema: z.object({
      name: z.string().min(1),
      url: z.string().url(),
      description: z.string().optional(),
    }),
    execute: stubExecute,
  },
  {
    id: "attract.listTriggerLinks",
    title: "List Trigger Links",
    description: "Browse existing trigger links",
    category: "Attract",
    icon: "ListChecks",
    inputSchema: z.object({
      query: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const url = new URL("https://services.leadconnectorhq.com/links/search");
      url.searchParams.set("locationId", locationId);
      if (input?.query) url.searchParams.set("query", input.query);
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}`, Version: "2021-04-15", Accept: "application/json" },
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to list trigger links (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "attract.getTriggerLinkUrl",
    title: "Get Trigger Link URL",
    description: "Select a trigger link and copy its URL",
    category: "Attract",
    icon: "Copy",
    inputSchema: z.object({
      triggerLinkId: z.string().min(1),
    }),
    execute: async (_ctx, input) => {
      // Field key format is {{trigger_link.<id>}}
      const fieldKey = `{{trigger_link.${input.triggerLinkId}}}`;
      return { status: "success", data: { fieldKey } };
    },
  },
  {
    id: "attract.createBlogPostDraft",
    title: "Create Blog Draft",
    description: "Create a new blog post draft",
    category: "Attract",
    icon: "FilePlus",
    inputSchema: z.object({
      title: z.string().min(1),
      slug: z.string().optional(),
      content: z.string().optional(),
    }),
    execute: stubExecute,
  },
  {
    id: "attract.publishBlogPost",
    title: "Publish Blog Post",
    description: "Publish an existing blog post",
    category: "Attract",
    icon: "ListPlus",
    inputSchema: z.object({
      postId: z.string().min(1),
      publishAt: z.string().optional(),
    }),
    execute: stubExecute,
  },
  {
    id: "attract.createBlogCategory",
    title: "Create Blog Category",
    description: "Create a blog category",
    category: "Attract",
    icon: "ListPlus",
    inputSchema: z.object({
      name: z.string().min(1),
      slug: z.string().optional(),
    }),
    execute: stubExecute,
  },
  {
    id: "attract.listSocialAccounts",
    title: "List Social Accounts",
    description: "List connected social accounts",
    category: "Attract",
    icon: "Users",
    inputSchema: z.object({}),
    execute: async (ctx) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const url = `https://services.leadconnectorhq.com/social-media-posting/${locationId}/accounts`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Version: "2021-04-15", Accept: "application/json" },
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to list social accounts (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "attract.scheduleSocialPost",
    title: "Schedule Social Post",
    description: "Schedule a post to a social account",
    category: "Attract",
    icon: "Calendar",
    inputSchema: z.object({
      accountId: z.string().min(1),
      content: z.string().min(1),
      publishAt: z.string().optional(),
      mediaId: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      // Social planner uses CSV posts endpoint
      const url = `https://services.leadconnectorhq.com/social-media-posting/${locationId}/csv`;
      const payload: any = {
        content: input.content,
        publishAt: input.publishAt,
        accounts: [input.accountId],
      };
      if (input.mediaId) payload.mediaId = input.mediaId;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Version: "2021-04-15", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to schedule social post (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "attract.uploadMedia",
    title: "Upload Media",
    description: "Upload an asset for reuse",
    category: "Attract",
    icon: "FilePlus",
    inputSchema: z.object({
      fileUrl: z.string().url(),
      name: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token } = gh as { token: string; locationId: string };
      const uploadUrl = "https://services.leadconnectorhq.com/medias/upload-file";
      const form = new FormData();
      // Fetch the file and append as blob
      const fileResp = await fetch(input.fileUrl);
      if (!fileResp.ok) return { status: "failed", error: { message: `Failed to fetch file (${fileResp.status})` } };
      const blob = await fileResp.blob();
      const filename = input.name || "upload.bin";
      form.append("file", new File([blob], filename));
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form as any,
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to upload media (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },

  // Capture (supported)
  {
    id: "capture.createContact",
    title: "Create Contact",
    description: "Create a new contact",
    category: "Capture",
    icon: "UserPlus",
    inputSchema: z.object({
      firstName: z.string().min(1),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const contacts = new GHLContactsService(token, locationId);
      const created = await contacts.createContact({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        locationId,
      } as any);
      return { status: "success", data: created };
    },
  },
  {
    id: "capture.addTagsToContact",
    title: "Add Tags to Contact",
    description: "Attach tags to a contact",
    category: "Capture",
    icon: "Hash",
    inputSchema: z.object({
      contactId: z.string().min(1),
      tags: z.array(z.string().min(1)).min(1),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const contacts = new GHLContactsService(token, locationId);
      const contact = await contacts.getContact(input.contactId);
      const currentTags: string[] = Array.isArray(contact?.tags) ? (contact.tags as any) : [];
      const nextTags = Array.from(new Set([...(currentTags as any), ...input.tags]));
      const updated = await contacts.updateContact(input.contactId, { id: input.contactId, tags: nextTags } as any);
      return { status: "success", data: updated };
    },
  },
  {
    id: "capture.listForms",
    title: "List Forms",
    description: "Browse existing forms",
    category: "Capture",
    icon: "ListChecks",
    inputSchema: z.object({
      query: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token } = gh as { token: string; locationId: string };
      const res = await fetch("https://services.leadconnectorhq.com/forms/", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to list forms (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "capture.createCustomField",
    title: "Create Custom Field",
    description: "Create a contact custom field",
    category: "Capture",
    icon: "FileCog",
    inputSchema: z.object({
      label: z.string().min(1),
      type: z.enum(["text", "number", "date", "select"]).default("text"),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const res = await fetch("https://services.leadconnectorhq.com/custom-fields/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28", "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          label: input.label,
          type: input.type,
          model: "contact",
        }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to create custom field (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "capture.setFormRedirect",
    title: "Set Form Redirect",
    description: "Configure thank-you/redirect URL",
    category: "Capture",
    icon: "Link",
    inputSchema: z.object({
      formId: z.string().min(1),
      redirectUrl: z.string().url(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token } = gh as { token: string; locationId: string };
      const res = await fetch(`https://services.leadconnectorhq.com/forms/${input.formId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ redirectUrl: input.redirectUrl }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to update form redirect (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "capture.toggleFormDoubleOptIn",
    title: "Toggle Form Double Opt-in",
    description: "Enable/disable double opt-in",
    category: "Capture",
    icon: "Trophy",
    inputSchema: z.object({
      formId: z.string().min(1),
      enabled: z.boolean(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token } = gh as { token: string; locationId: string };
      const res = await fetch(`https://services.leadconnectorhq.com/forms/${input.formId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ doubleOptInEnabled: input.enabled }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to toggle double opt-in (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "capture.createCompany",
    title: "Create Company",
    description: "Create a company record",
    category: "Capture",
    icon: "Briefcase",
    inputSchema: z.object({
      name: z.string().min(1),
      domain: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const res = await fetch("https://services.leadconnectorhq.com/businesses/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: input.name, locationId, website: input.domain }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to create company (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "capture.associateContactCompany",
    title: "Associate Contact to Company",
    description: "Link a contact with a company",
    category: "Capture",
    icon: "UserCircle",
    inputSchema: z.object({
      contactId: z.string().min(1),
      companyId: z.string().min(1),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      // Association between contact and business (company) via associations API requires an associationId
      // For now, attempt a generic association payload if associationId is pre-configured
      const res = await fetch("https://services.leadconnectorhq.com/associations/relations", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28", "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          associationId: "contact_business", // placeholder; replace with actual association id configured in account
          firstRecordId: input.contactId,
          secondRecordId: input.companyId,
        }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to associate contact and company (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "capture.listCalendars",
    title: "List Calendars",
    description: "Browse calendars for booking",
    category: "Capture",
    icon: "Calendar",
    inputSchema: z.object({}),
    execute: async (ctx) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const url = `https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", Version: "2021-07-28" },
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to list calendars (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "capture.removeTagsFromContact",
    title: "Remove Tags from Contact",
    description: "Remove tag(s) from a contact",
    category: "Capture",
    icon: "Hash",
    inputSchema: z.object({
      contactId: z.string().min(1),
      tags: z.array(z.string().min(1)).min(1),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const contacts = new GHLContactsService(token, locationId);
      const contact = await contacts.getContact(input.contactId);
      const currentTags: string[] = Array.isArray(contact?.tags) ? (contact.tags as any) : [];
      const nextTags = currentTags.filter((t) => !input.tags.includes(String(t)));
      await contacts.updateContact(input.contactId, { id: input.contactId, tags: nextTags } as any);
      return { status: "success", data: { updated: true, tags: nextTags } };
    },
  },
  {
    id: "capture.createAppointment",
    title: "Create Appointment",
    description: "Book an appointment for a contact",
    category: "Capture",
    icon: "CalendarPlus",
    inputSchema: z.object({
      contactId: z.string().min(1),
      calendarId: z.string().min(1),
      startAt: z.string().min(1),
      endAt: z.string().optional(),
      notes: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token } = gh as { token: string; locationId: string };
      const res = await fetch(`https://services.leadconnectorhq.com/appointments/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28", "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: input.contactId, calendarId: input.calendarId, startAt: input.startAt, endAt: input.endAt, notes: input.notes }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to create appointment (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "capture.createOpportunityForContact",
    title: "Create Opportunity for Contact",
    description: "Create an opportunity linked to a contact",
    category: "Capture",
    icon: "Briefcase",
    inputSchema: z.object({
      contactId: z.string().min(1),
      pipelineId: z.string().min(1),
      stageId: z.string().min(1),
      name: z.string().optional(),
      value: z.number().nonnegative().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const opps = new GHLOpportunitiesService(token, locationId);
      const created = await opps.createOpportunity({
        pipelineId: input.pipelineId,
        pipelineStageId: input.stageId,
        locationId,
        contactId: input.contactId,
        name: input.name || "New Opportunity",
        monetaryValue: input.value,
      } as any);
      return { status: "success", data: created };
    },
  },
  // Forms (Capture)
  {
    id: "capture.createForm",
    title: "Create Form",
    description: "Create a new form",
    category: "Capture",
    icon: "FilePlus",
    inputSchema: z.object({
      name: z.string().min(1),
      folderId: z.string().optional(),
      description: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const res = await fetch(`https://services.leadconnectorhq.com/forms/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: input.name, folderId: input.folderId, description: input.description, locationId }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to create form (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "capture.getFormEmbedCode",
    title: "Get Form Embed Code",
    description: "Retrieve embed script for a form",
    category: "Capture",
    icon: "Link",
    inputSchema: z.object({
      formId: z.string().min(1),
    }),
    execute: async (_ctx, input) => {
      const formId = input.formId;
      const widgetUrl = `https://link.msgsndr.com/widget/form/${formId}`;
      const iframe = `<iframe src="${widgetUrl}" style=\"width:100%;height:100%;border:0;\" frameborder=\"0\"></iframe>`;
      const script = `<script src=\"${widgetUrl}\"></script>`;
      return { status: "success", data: { widgetUrl, iframe, script } };
    },
  },

  // Nurture (supported)
  {
    id: "nurture.sendSmsToContact",
    title: "Send SMS",
    description: "Send an SMS to a contact",
    category: "Nurture",
    icon: "MessageSquare",
    inputSchema: z.object({
      contactId: z.string().min(1),
      fromNumber: z.string().min(1),
      message: z.string().min(1),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const svc = new GHLConversationsService(token, locationId);
      await svc.createMessage({
        type: "SMS",
        contactId: input.contactId,
        message: input.message,
        fromNumber: input.fromNumber,
      });
      return { status: "success", data: { sent: true } };
    },
  },
  {
    id: "nurture.sendEmailToContact",
    title: "Send Email",
    description: "Send an email to a contact",
    category: "Nurture",
    icon: "Mail",
    inputSchema: z.object({
      contactId: z.string().min(1),
      emailFrom: z.string().email(),
      subject: z.string().min(1),
      html: z.string().optional(),
      text: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const svc = new GHLConversationsService(token, locationId);
      await svc.createMessage({
        type: "Email",
        contactId: input.contactId,
        emailFrom: input.emailFrom,
        subject: input.subject,
        html: input.html,
        message: input.text,
      });
      return { status: "success", data: { sent: true } };
    },
  },
  {
    id: "nurture.sendWhatsAppMessage",
    title: "Send WhatsApp",
    description: "Send a WhatsApp message",
    category: "Nurture",
    icon: "PhoneCall",
    inputSchema: z.object({
      contactId: z.string().min(1),
      templateId: z.string().optional(),
      message: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const svc = new GHLConversationsService(token, locationId);
      await svc.createMessage({
        type: "WhatsApp",
        contactId: input.contactId,
        message: input.message,
        templateId: input.templateId,
      });
      return { status: "success", data: { sent: true } };
    },
  },
  {
    id: "nurture.createConversationFromTemplate",
    title: "Start Conversation from Template",
    description: "Start a conversation using a saved template",
    category: "Nurture",
    icon: "MessageCircle",
    inputSchema: z.object({
      contactId: z.string().min(1),
      channel: z.enum(["SMS", "Email", "WhatsApp"]),
      templateId: z.string().min(1),
      params: z.record(z.string()).optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const svc = new GHLConversationsService(token, locationId);
      await svc.createMessage({
        type: input.channel,
        contactId: input.contactId,
        templateId: input.templateId,
      });
      return { status: "success", data: { started: true } };
    },
  },
  {
    id: "nurture.sendMms",
    title: "Send MMS",
    description: "Send an SMS with media attachment",
    category: "Nurture",
    icon: "MessageSquare",
    inputSchema: z.object({
      contactId: z.string().min(1),
      fromNumber: z.string().min(1),
      message: z.string().min(1),
      attachments: z.array(z.string().url()).min(1),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const svc = new GHLConversationsService(token, locationId);
      await svc.createMessage({
        type: "SMS",
        contactId: input.contactId,
        message: input.message,
        fromNumber: input.fromNumber,
        attachments: input.attachments,
      });
      return { status: "success", data: { sent: true } };
    },
  },
  {
    id: "nurture.scheduleMessage",
    title: "Schedule Message",
    description: "Schedule SMS/Email for later",
    category: "Nurture",
    icon: "CalendarClock",
    inputSchema: z.object({
      contactId: z.string().min(1),
      type: z.enum(["SMS", "Email"]).default("SMS"),
      message: z.string().min(1),
      subject: z.string().optional(),
      scheduledTimestamp: z.number().int().positive(),
      emailFrom: z.string().email().optional(),
      fromNumber: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const svc = new GHLConversationsService(token, locationId);
      await svc.createMessage({
        type: input.type,
        contactId: input.contactId,
        message: input.message,
        subject: input.subject,
        emailFrom: input.emailFrom,
        fromNumber: input.fromNumber,
        scheduledTimestamp: input.scheduledTimestamp,
      });
      return { status: "success", data: { scheduled: true } };
    },
  },
  {
    id: "nurture.assignConversation",
    title: "Assign Conversation",
    description: "Assign conversation to a user",
    category: "Nurture",
    icon: "UserRoundCheck",
    inputSchema: z.object({
      conversationId: z.string().min(1),
      userId: z.string().min(1),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const svc = new GHLConversationsService(token, locationId);
      await svc.updateConversation(input.conversationId, { assigned: true, assignedTo: input.userId });
      return { status: "success", data: { assigned: true } };
    },
  },
  {
    id: "nurture.markConversationRead",
    title: "Mark Conversation Read",
    description: "Mark a conversation as read",
    category: "Nurture",
    icon: "ListChecks",
    inputSchema: z.object({
      conversationId: z.string().min(1),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const svc = new GHLConversationsService(token, locationId);
      await svc.updateConversation(input.conversationId, { status: "read" as any });
      return { status: "success", data: { read: true } };
    },
  },
  {
    id: "nurture.addToWorkflow",
    title: "Add to Workflow",
    description: "Add a contact to a workflow",
    category: "Nurture",
    icon: "Workflow",
    inputSchema: z.object({
      contactId: z.string().min(1),
      workflowId: z.string().min(1),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const svc = new GHLConversationsService(token, locationId);
      await svc.updateConversation(input.conversationId, { status: "read" as any });
      return { status: "success", data: { read: true } };
    },
  },
  {
    id: "nurture.removeFromWorkflow",
    title: "Remove from Workflow",
    description: "Remove a contact from a workflow",
    category: "Nurture",
    icon: "Workflow",
    inputSchema: z.object({
      contactId: z.string().min(1),
      workflowId: z.string().min(1),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const res = await fetch(`https://services.leadconnectorhq.com/workflows/${input.workflowId}/remove-contact`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28", "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: input.contactId, locationId }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to remove from workflow (${res.status})` } };
      return { status: "success", data: { removed: true } };
    },
  },
  {
    id: "nurture.createTask",
    title: "Create Task",
    description: "Create a follow-up task for a contact",
    category: "Nurture",
    icon: "ListPlus",
    inputSchema: z.object({
      contactId: z.string().min(1),
      title: z.string().min(1),
      dueDate: z.string().optional(),
      assignedTo: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const res = await fetch(`https://services.leadconnectorhq.com/tasks/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28", "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: input.contactId, title: input.title, dueDate: input.dueDate, assignedTo: input.assignedTo, locationId }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to create task (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "nurture.setContactDnd",
    title: "Set Contact DND",
    description: "Enable or disable DND for specific channels",
    category: "Nurture",
    icon: "BellOff",
    inputSchema: z.object({
      contactId: z.string().min(1),
      channels: z.array(z.enum(["Call", "Email", "SMS", "WhatsApp", "GMB", "FB"])).min(1),
      status: z.enum(["active", "inactive", "permanent"]).default("active"),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const svc = new GHLContactsService(token, locationId);
      const dndSettings: any = {};
      for (const ch of input.channels) {
        dndSettings[ch] = { status: input.status };
      }
      await svc.updateContact(input.contactId, {
        id: input.contactId,
        dndSettings,
      } as any);
      return { status: "success", data: { updated: true } };
    },
  },

  // Convert (supported)
  {
    id: "convert.createOpportunity",
    title: "Create Opportunity",
    description: "Create a new opportunity",
    category: "Convert",
    icon: "Briefcase",
    inputSchema: z.object({
      pipelineId: z.string().min(1),
      stageId: z.string().min(1),
      name: z.string().min(1),
      value: z.number().nonnegative().optional(),
      contactId: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const opps = new GHLOpportunitiesService(token, locationId);
      const created = await opps.createOpportunity({
        pipelineId: input.pipelineId,
        pipelineStageId: input.stageId,
        locationId,
        contactId: input.contactId,
        name: input.name,
        monetaryValue: input.value,
      } as any);
      return { status: "success", data: created };
    },
  },
  {
    id: "convert.moveOpportunityStage",
    title: "Move Opportunity Stage",
    description: "Move an opportunity to another stage",
    category: "Convert",
    icon: "ArrowRightLeft",
    inputSchema: z.object({
      opportunityId: z.string().min(1),
      stageId: z.string().min(1),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const opps = new GHLOpportunitiesService(token, locationId);
      const updated = await opps.updateOpportunity(input.opportunityId, { pipelineStageId: input.stageId });
      return { status: "success", data: updated };
    },
  },
  {
    id: "convert.updateOpportunityValue",
    title: "Update Opportunity Value",
    description: "Update the deal amount",
    category: "Convert",
    icon: "DollarSign",
    inputSchema: z.object({
      opportunityId: z.string().min(1),
      amount: z.number().nonnegative(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const opps = new GHLOpportunitiesService(token, locationId);
      const updated = await opps.updateOpportunity(input.opportunityId, { monetaryValue: input.amount });
      return { status: "success", data: updated };
    },
  },
  {
    id: "convert.assignOpportunityOwner",
    title: "Assign Opportunity Owner",
    description: "Assign a user to the opportunity",
    category: "Convert",
    icon: "UserCircle",
    inputSchema: z.object({
      opportunityId: z.string().min(1),
      userId: z.string().min(1),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const opps = new GHLOpportunitiesService(token, locationId);
      const updated = await opps.updateOpportunity(input.opportunityId, { assignedTo: input.userId });
      return { status: "success", data: updated };
    },
  },
  {
    id: "convert.markDealStatus",
    title: "Mark Deal Won/Lost",
    description: "Set the deal status",
    category: "Convert",
    icon: "Trophy",
    inputSchema: z.object({
      opportunityId: z.string().min(1),
      status: z.enum(["won", "lost"]),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const opps = new GHLOpportunitiesService(token, locationId);
      const updated = await opps.updateOpportunity(input.opportunityId, { status: input.status });
      return { status: "success", data: updated };
    },
  },
  {
    id: "convert.createInvoice",
    title: "Create Invoice",
    description: "Create an invoice for a contact",
    category: "Convert",
    icon: "Receipt",
    inputSchema: z.object({
      contactId: z.string().min(1),
      items: z
        .array(
          z.object({
            name: z.string().min(1),
            amount: z.number().nonnegative(),
            quantity: z.number().int().positive().default(1),
          })
        )
        .min(1),
      dueDate: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const res = await fetch("https://services.leadconnectorhq.com/payments/invoices/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", Version: "2021-07-28", "Content-Type": "application/json" },
        body: JSON.stringify({
          altId: locationId,
          altType: "locationId",
          contactId: input.contactId,
          items: input.items.map((i: any) => ({ name: i.name, amount: i.amount, qty: i.quantity })),
          dueDate: input.dueDate,
        }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to create invoice (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "convert.createProduct",
    title: "Create Product",
    description: "Create a product",
    category: "Convert",
    icon: "FilePlus",
    inputSchema: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const res = await fetch("https://services.leadconnectorhq.com/payments/products/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", Version: "2021-07-28", "Content-Type": "application/json" },
        body: JSON.stringify({
          altId: locationId,
          altType: "locationId",
          name: input.name,
          description: input.description,
        }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to create product (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "convert.createPrice",
    title: "Create Price",
    description: "Create a price for a product",
    category: "Convert",
    icon: "DollarSign",
    inputSchema: z.object({
      productId: z.string().min(1),
      amount: z.number().int().positive(),
      currency: z.string().min(1),
      interval: z.enum(["one_time", "day", "week", "month", "year"]).default("one_time"),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const res = await fetch("https://services.leadconnectorhq.com/payments/prices/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", Version: "2021-07-28", "Content-Type": "application/json" },
        body: JSON.stringify({
          altId: locationId,
          altType: "locationId",
          productId: input.productId,
          unitAmount: input.amount,
          currency: input.currency,
          interval: input.interval === "one_time" ? undefined : input.interval,
        }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to create price (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "convert.createPaymentLink",
    title: "Create Payment Link",
    description: "Generate a payment link",
    category: "Convert",
    icon: "Link",
    inputSchema: z.object({
      contactId: z.string().min(1),
      priceId: z.string().optional(),
      amount: z.number().int().positive().optional(),
      memo: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const res = await fetch("https://services.leadconnectorhq.com/payments/payment-links/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", Version: "2021-07-28", "Content-Type": "application/json" },
        body: JSON.stringify({
          altId: locationId,
          altType: "locationId",
          contactId: input.contactId,
          priceId: input.priceId,
          amount: input.amount,
          memo: input.memo,
        }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to create payment link (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "convert.emailInvoice",
    title: "Email Invoice",
    description: "Send invoice to contact",
    category: "Convert",
    icon: "Mail",
    inputSchema: z.object({
      invoiceId: z.string().min(1),
      emailTo: z.string().email(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token, locationId } = gh as { token: string; locationId: string };
      const res = await fetch("https://services.leadconnectorhq.com/payments/invoices/email", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          altId: locationId,
          altType: "locationId",
          invoiceId: input.invoiceId,
          emailTo: input.emailTo,
        }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to email invoice (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "convert.cancelAppointment",
    title: "Cancel Appointment",
    description: "Cancel an existing appointment",
    category: "Convert",
    icon: "Calendar",
    inputSchema: z.object({
      appointmentId: z.string().min(1),
      reason: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token } = gh as { token: string; locationId: string };
      const res = await fetch(`https://services.leadconnectorhq.com/appointments/${input.appointmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28" },
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to cancel appointment (${res.status})` } };
      return { status: "success", data: { cancelled: true } };
    },
  },
  {
    id: "convert.rescheduleAppointment",
    title: "Reschedule Appointment",
    description: "Reschedule an existing appointment",
    category: "Convert",
    icon: "CalendarClock",
    inputSchema: z.object({
      appointmentId: z.string().min(1),
      startAt: z.string().min(1),
      endAt: z.string().optional(),
      notes: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token } = gh as { token: string; locationId: string };
      const res = await fetch(`https://services.leadconnectorhq.com/appointments/${input.appointmentId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28", "Content-Type": "application/json" },
        body: JSON.stringify({ startAt: input.startAt, endAt: input.endAt, notes: input.notes }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to reschedule appointment (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
  {
    id: "convert.scheduleFollowUpAppointment",
    title: "Schedule Follow-up",
    description: "Schedule a follow-up appointment",
    category: "Convert",
    icon: "CalendarClock",
    inputSchema: z.object({
      contactId: z.string().min(1),
      calendarId: z.string().min(1),
      startAt: z.string().min(1),
      notes: z.string().optional(),
    }),
    execute: async (ctx, input) => {
      const gh = requireGhl(ctx);
      if ((gh as ActionResult).status === "failed") return gh as ActionResult;
      const { token } = gh as { token: string; locationId: string };
      const res = await fetch(`https://services.leadconnectorhq.com/appointments/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28", "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: input.contactId, calendarId: input.calendarId, startAt: input.startAt, notes: input.notes }),
      });
      if (!res.ok) return { status: "failed", error: { message: `Failed to create appointment (${res.status})` } };
      const data = await res.json();
      return { status: "success", data };
    },
  },
];

export function getActionsByCategory(category: ActionCategory): AnyActionDefinition[] {
  return ACTIONS.filter((a) => a.category === category);
}

export function findActionById(id: string): AnyActionDefinition | undefined {
  return ACTIONS.find((a) => a.id === id);
}


