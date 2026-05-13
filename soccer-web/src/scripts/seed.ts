import "dotenv/config";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Abort.");
  process.exit(1);
}

const sql = neon(databaseUrl);

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding database (raw SQL)...");

  const password = "pass123";
  const passwordHash = bcrypt.hashSync(password, 10);

  const emails = [
    "steve@gmail.com",
    "peter@gmail.com",
    "dave@gmail.com",
    "john@gmail.com",
    "nick@gmail.com",
  ];
  for (let i = 1; i <= 9; i++) emails.push(`user${i}@example.com`);

  const usersMap = new Map<string, string>();
  for (const email of emails) {
    const name = email.includes("@") ? email.split("@")[0] : email;
    const res = await sql.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [email, passwordHash, name]
    );
    const uid = Array.isArray(res) ? res[0].id : (res as any).rows[0].id;
    usersMap.set(email, uid);
  }

  const ensureGroup = async (title: string, description: string) => {
    const sel = await sql.query(`SELECT id FROM groups WHERE title = $1 LIMIT 1`, [title]);
    const selId = Array.isArray(sel) ? (sel[0] && sel[0].id) : (sel as any).rows[0]?.id;
    if (selId) return selId;
    const ins = await sql.query(`INSERT INTO groups (title, description) VALUES ($1, $2) RETURNING id`, [title, description]);
    return Array.isArray(ins) ? ins[0].id : (ins as any).rows[0].id;
  };

  const sofiaId = await ensureGroup("Sofia Derby", "Local Sofia derby players");
  const sundayId = await ensureGroup("Sunday Heroes", "Weekend pickup squad");

  const sofiaMembers = [
    "steve@gmail.com",
    "dave@gmail.com",
    "nick@gmail.com",
    ...Array.from({ length: 9 }, (_, i) => `user${i + 1}@example.com`),
  ];

  const sundayMembers = [
    "steve@gmail.com",
    "peter@gmail.com",
    "john@gmail.com",
    ...Array.from({ length: 9 }, (_, i) => `user${i + 1}@example.com`),
  ];

  for (const email of sofiaMembers) {
    await sql.query(
      `INSERT INTO group_members (group_id, user_id, is_manager) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [sofiaId, usersMap.get(email), email === "steve@gmail.com"]
    );
  }

  for (const email of sundayMembers) {
    await sql.query(
      `INSERT INTO group_members (group_id, user_id, is_manager) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [sundayId, usersMap.get(email), email === "steve@gmail.com" || email === "peter@gmail.com"]
    );
  }

  const now = new Date();
  const m1 = await sql.query(`INSERT INTO matches (group_id, starts_at, location, capacity) VALUES ($1, $2, $3, $4) RETURNING id`, [sofiaId, addDays(now, 3).toISOString(), "The School", 12]);
  const m2 = await sql.query(`INSERT INTO matches (group_id, starts_at, location, capacity) VALUES ($1, $2, $3, $4) RETURNING id`, [sofiaId, addDays(now, 5).toISOString(), "Students Town", 12]);
  const m3 = await sql.query(`INSERT INTO matches (group_id, starts_at, location, capacity) VALUES ($1, $2, $3, $4) RETURNING id`, [sundayId, addDays(now, 6).toISOString(), "Arena 111", 10]);

  const mid1 = Array.isArray(m1) ? m1[0].id : (m1 as any).rows[0].id;
  const mid2 = Array.isArray(m2) ? m2[0].id : (m2 as any).rows[0].id;
  const mid3 = Array.isArray(m3) ? m3[0].id : (m3 as any).rows[0].id;

  const matches = [mid1, mid2, mid3];

  const commentTemplates = [
    "Can't wait to play!",
    "I'm in!",
    "See you there",
    "Count me in",
    "I'll bring the cones",
    "Might be a bit late",
    "Who's bringing water?",
    "Excited for this",
    "Let's go!",
  ];

  for (const matchId of matches) {
    const isSofia = matchId === mid1 || matchId === mid2;
    const members = isSofia ? sofiaMembers : sundayMembers;
    const half = Math.ceil(members.length / 2);
    const selected = members.slice(0, half);
    for (const email of selected) {
      await sql.query(`INSERT INTO match_joins (match_id, user_id, extra_slots) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [matchId, usersMap.get(email), 0]);
    }
    const commenters = selected.slice(0, Math.min(3, selected.length));
    for (const [ci, email] of commenters.entries()) {
      const template = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
      const text = `${template} - ${email.split("@")[0]}`;
      await sql.query(`INSERT INTO match_comments (match_id, user_id, text) VALUES ($1, $2, $3)`, [matchId, usersMap.get(email), text]);
    }
  }

  console.log("Seeding complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
