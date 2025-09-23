// pages/api/tools/daily-snapshot.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const locationId = req.query.locationId as string;

  if (!locationId) {
    return res.status(400).json({ error: "Missing locationId" });
  }

  const fetchGHL = async (endpoint: string) => {
    const res = await fetch(`https://api.gohighlevel.com/v1/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${process.env.GHL_PIT}`, // or per-user stored token
      },
    });
    return res.json();
  };

  const fetchCalendarEvents = async () => {
    const calendars = await fetchGHL(`calendars?locationId=${locationId}`);
    return Promise.all(
      calendars.map((c: any) =>
        fetchGHL(
          `calendars/events?calendarId=${c.id}&startTime=${
            new Date().toISOString().split("T")[0]
          }&endTime=${new Date().toISOString().split("T")[0]}`
        )
      )
    ).then((results) => results.flat());
  };

  const [contacts, payments, tasks, opportunities, calendarEvents] =
    await Promise.all([
      fetchGHL(
        `contacts?locationId=${locationId}&createdAfter=${
          new Date().toISOString().split("T")[0]
        }`
      ),
      fetchGHL(
        `payments?locationId=${locationId}&createdAfter=${
          new Date().toISOString().split("T")[0]
        }`
      ),
      fetchGHL(
        `tasks?locationId=${locationId}&dueDate=${
          new Date().toISOString().split("T")[0]
        }`
      ),
      // fetch opportunities
      fetchGHL(`opportunities?locationId=${locationId}`),
      fetchCalendarEvents(),
    ]);

  const totalRevenue = payments.reduce(
    (sum: number, p: any) => sum + (p.amount || 0),
    0
  );

  res.status(200).json({
    leadsToday: contacts.length,
    revenueToday: totalRevenue,
    tasksDue: tasks.length,
    opportunities,
    calendarEvents,
    voiceSummary: `You have ${contacts.length} new leads, ${tasks.length} tasks due, and collected $${totalRevenue} today.`,
  });
}
