import "dotenv/config";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Abort.");
  process.exit(1);
}

const sql = neon(databaseUrl);

interface QueryResult {
  id: string;
}

function extractId(result: QueryResult[] | { rows: QueryResult[] }): string {
  return Array.isArray(result) ? result[0].id : result.rows[0].id;
}

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
    const uid = extractId(res as QueryResult[] | { rows: QueryResult[] });
    usersMap.set(email, uid);
  }
  console.log(`✓ ${emails.length} users inserted.`);

  const ensureGroup = async (title: string, description: string) => {
    const sel = await sql.query(`SELECT id FROM groups WHERE title = $1 LIMIT 1`, [title]);
    const selId = extractId(sel as QueryResult[] | { rows: QueryResult[] });
    if (selId) return selId;
    const ins = await sql.query(`INSERT INTO groups (title, description) VALUES ($1, $2) RETURNING id`, [title, description]);
    return extractId(ins as QueryResult[] | { rows: QueryResult[] });
  };

  const sofiaId = await ensureGroup("Sofia Derby", "Local Sofia derby players");
  const sundayId = await ensureGroup("Sunday Heroes", "Weekend pickup squad");
  console.log(`✓ 2 groups inserted.`);

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

  let groupMembersCount = 0;
  for (const email of sofiaMembers) {
    await sql.query(
      `INSERT INTO group_members (group_id, user_id, is_manager) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [sofiaId, usersMap.get(email), email === "steve@gmail.com"]
    );
    groupMembersCount++;
  }

  for (const email of sundayMembers) {
    await sql.query(
      `INSERT INTO group_members (group_id, user_id, is_manager) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [sundayId, usersMap.get(email), email === "steve@gmail.com" || email === "peter@gmail.com"]
    );
    groupMembersCount++;
  }
  console.log(`✓ ${groupMembersCount} group members inserted.`);

  const now = new Date();
  const m1 = await sql.query(`INSERT INTO matches (group_id, starts_at, location, capacity) VALUES ($1, $2, $3, $4) RETURNING id`, [sofiaId, addDays(now, 3).toISOString(), "The School", 12]);
  const m2 = await sql.query(`INSERT INTO matches (group_id, starts_at, location, capacity) VALUES ($1, $2, $3, $4) RETURNING id`, [sofiaId, addDays(now, 5).toISOString(), "Students Town", 12]);
  const m3 = await sql.query(`INSERT INTO matches (group_id, starts_at, location, capacity) VALUES ($1, $2, $3, $4) RETURNING id`, [sundayId, addDays(now, 6).toISOString(), "Arena 111", 10]);

  const mid1 = extractId(m1 as QueryResult[] | { rows: QueryResult[] });
  const mid2 = extractId(m2 as QueryResult[] | { rows: QueryResult[] });
  const mid3 = extractId(m3 as QueryResult[] | { rows: QueryResult[] });

  const matches = [mid1, mid2, mid3];
  console.log(`✓ ${matches.length} matches inserted.`);

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

  let matchJoinsCount = 0;
  let matchCommentsCount = 0;

  for (const matchId of matches) {
    const isSofia = matchId === mid1 || matchId === mid2;
    const members = isSofia ? sofiaMembers : sundayMembers;
    const half = Math.ceil(members.length / 2);
    const selected = members.slice(0, half);
    for (const email of selected) {
      await sql.query(`INSERT INTO match_joins (match_id, user_id, extra_slots) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [matchId, usersMap.get(email), 0]);
      matchJoinsCount++;
    }
    const commenters = selected.slice(0, Math.min(3, selected.length));
    for (const email of commenters) {
      const template = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
      const text = `${template} - ${email.split("@")[0]}`;
      await sql.query(`INSERT INTO match_comments (match_id, user_id, text) VALUES ($1, $2, $3)`, [matchId, usersMap.get(email), text]);
      matchCommentsCount++;
    }
  }

  console.log(`✓ ${matchJoinsCount} match joins inserted.`);
  console.log(`✓ ${matchCommentsCount} match comments inserted.`);

  console.log("Seeding complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
