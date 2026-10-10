# Database storage and access control

The application connects to the existing Supabase project through its public API.

| Location           | Stored information                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `donations`        | Payment method, amount, currency, private transaction reference, name preference, message, status, timestamps, and saved exchange-rate conversion |
| `campaign`         | Community goal, payment addresses, campaign state, purchase status, receipt URL, and purchase notes                                               |
| `campaign_admins`  | Supabase Auth user IDs permitted to manage the campaign                                                                                           |
| `public_donations` | View of approved contributions, limited to public fields; hidden names appear as Anonymous                                                        |
| Supabase Auth      | Administrator accounts and authentication sessions                                                                                                |

Public progress is calculated from the approved contributions returned by `public_donations`. Pending, rejected, and refunded submissions do not count. Approved contributions retain their saved conversion amounts; the approximate INR equivalent of the goal uses the current exchange rate.

The browser does not store donation records or campaign settings. Supabase Auth manages the sign-in session, and the exchange-rate client caches its latest rate in browser storage. The read-only design preview uses temporary in-memory fixtures without connecting to Supabase.

## Migration for an existing project

Use [secure_existing_database.sql](secure_existing_database.sql) to replace the legacy access rules while preserving existing donations, conversions, and campaign settings.

1. Confirm the existing administrator's email under **Supabase → Authentication → Users**.
2. Set `v_admin_email` near the start of the migration to that email.
3. Run the complete file in **Supabase → SQL Editor** as the project administrator.
4. Sign in to the website and verify the private review list, campaign settings, public contributions, and totals.

The migration runs in one transaction and can be repeated. If the administrator account is absent, it aborts without applying changes. It inserts the administrator's ID into the allowlist, replaces table policies and function permissions, and recreates the public view. It does not update or delete existing donation rows or campaign values.

After migration, visitors can submit pending payments and read approved public fields. Private transaction references, approvals, and campaign updates require an allowlisted administrator. Functions use a fixed search path; the owner-executed public view exposes only its explicit public projection.

The migration preserves the saved funding goal, including the legacy $370 value. The website uses the intended $260 community target from `COMMUNITY_GOAL_USD` in `src/config.ts`, with a $205 developer commitment. Campaign settings do not rewrite the stored goal.

`schema.sql` and `fix_rls.sql` are legacy scripts retained for reference. Do not reapply them after the migration: their permissive rules would restore public access to private records. Do not rerun the historical amount update on an existing project.

A password was present in earlier schema comments. It has been removed from the current source but remains in Git history. Replace it in Supabase Auth if it is still in use.
