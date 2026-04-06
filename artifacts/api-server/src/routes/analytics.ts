import { Router, type IRouter } from "express";
import { db, analyticsEventsTable, analyticsOnlineTable, insertAnalyticsEventSchema } from "@workspace/db";
import { sql, count, countDistinct, gte, and, eq } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "iga2025";
const ONLINE_TIMEOUT_MINUTES = 5;

router.post("/analytics/heartbeat", async (req, res) => {
  const { visitor_id, session_id } = req.body;
  if (!visitor_id || !session_id) { res.status(400).json({ error: "Missing ids" }); return; }
  try {
    await db
      .insert(analyticsOnlineTable)
      .values({ visitor_id, session_id, last_seen: new Date(), page: 'active' })
      .onConflictDoUpdate({
        target: analyticsOnlineTable.visitor_id,
        set: { last_seen: new Date(), session_id },
      });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Internal server error" }); }
});

router.post("/analytics/event", async (req, res) => {
  try {
    const parsed = insertAnalyticsEventSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid event data" });
      return;
    }
    await db.insert(analyticsEventsTable).values(parsed.data);

    if (parsed.data.visitor_id && parsed.data.session_id) {
      await db
        .insert(analyticsOnlineTable)
        .values({
          visitor_id: parsed.data.visitor_id,
          session_id: parsed.data.session_id,
          last_seen: new Date(),
          page: parsed.data.event_type,
        })
        .onConflictDoUpdate({
          target: analyticsOnlineTable.visitor_id,
          set: {
            last_seen: new Date(),
            session_id: parsed.data.session_id,
            page: parsed.data.event_type,
          },
        });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/stats", async (req, res) => {
  const secret = req.headers["x-admin-secret"] ?? req.query["secret"];
  if (secret !== ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - ONLINE_TIMEOUT_MINUTES * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [onlineCountResult] = await db
      .select({ count: count() })
      .from(analyticsOnlineTable)
      .where(gte(analyticsOnlineTable.last_seen, fiveMinutesAgo));

    const [totalVisitorsResult] = await db
      .select({ count: countDistinct(analyticsEventsTable.visitor_id) })
      .from(analyticsEventsTable);

    const [totalSessionsResult] = await db
      .select({ count: countDistinct(analyticsEventsTable.session_id) })
      .from(analyticsEventsTable);

    const [todaySessionsResult] = await db
      .select({ count: countDistinct(analyticsEventsTable.session_id) })
      .from(analyticsEventsTable)
      .where(gte(analyticsEventsTable.created_at, todayStart));

    const [totalQuestionsResult] = await db
      .select({ count: count() })
      .from(analyticsEventsTable)
      .where(eq(analyticsEventsTable.event_type, "question_answered"));

    const [todayQuestionsResult] = await db
      .select({ count: count() })
      .from(analyticsEventsTable)
      .where(
        and(
          eq(analyticsEventsTable.event_type, "question_answered"),
          gte(analyticsEventsTable.created_at, todayStart)
        )
      );

    const subjectStatsRaw = await db
      .select({
        subject: analyticsEventsTable.subject,
        total: count(),
        correct: sql<number>`sum(case when ${analyticsEventsTable.is_correct} = true then 1 else 0 end)`,
      })
      .from(analyticsEventsTable)
      .where(and(eq(analyticsEventsTable.event_type, "question_answered"), sql`${analyticsEventsTable.subject} is not null`))
      .groupBy(analyticsEventsTable.subject);

    const daily: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      daily[key] = 0;
    }

    const dailyRaw = await db
      .select({
        day: sql<string>`to_char(${analyticsEventsTable.created_at}, 'YYYY-MM-DD')`,
        count: countDistinct(analyticsEventsTable.session_id),
      })
      .from(analyticsEventsTable)
      .where(gte(analyticsEventsTable.created_at, sevenDaysAgo))
      .groupBy(sql`to_char(${analyticsEventsTable.created_at}, 'YYYY-MM-DD')`);

    for (const row of dailyRaw) {
      if (row.day in daily) daily[row.day] = Number(row.count);
    }

    res.json({
      online: Number(onlineCountResult.count),
      total_visitors: Number(totalVisitorsResult.count),
      total_sessions: Number(totalSessionsResult.count),
      today_sessions: Number(todaySessionsResult.count),
      total_questions: Number(totalQuestionsResult.count),
      today_questions: Number(todayQuestionsResult.count),
      subject_stats: subjectStatsRaw,
      daily_sessions: daily,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
