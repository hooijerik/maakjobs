// Downgrade expired paid placements and flag finished orders. Run daily via cron:
//   npm run premiums:expire
// Note: the read paths (featured ranking + the isFeatured() badge) already ignore a
// past featured_until, so this is hygiene — it keeps the stored flag and the admin/
// premium_orders views accurate.
import { getDb } from "../lib/db";

function main() {
  const db = getDb();
  const jobs = db
    .prepare(
      "UPDATE jobs SET featured=0 WHERE featured=1 AND featured_until IS NOT NULL AND featured_until < datetime('now')",
    )
    .run();
  const companies = db
    .prepare(
      "UPDATE companies SET featured=0 WHERE featured=1 AND featured_until IS NOT NULL AND featured_until < datetime('now')",
    )
    .run();
  const orders = db
    .prepare(
      "UPDATE premium_orders SET status='expired' WHERE status='active' AND expires_at IS NOT NULL AND expires_at < datetime('now')",
    )
    .run();
  console.log(
    `Premium expiry — jobs:${jobs.changes ?? 0} companies:${companies.changes ?? 0} orders:${orders.changes ?? 0}`,
  );
}

main();
