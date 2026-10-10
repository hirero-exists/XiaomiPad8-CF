# Xiaomi Pad 8 Development Fund

React and TypeScript website for funding Xiaomi Pad 8 custom Android ROM development and hardware testing. The community goal is $260. The developer contributes approximately $205 toward the remaining tablet cost and the Focus Pen Pro, and covers shipping and import costs separately.

## Development

Requires Node.js 22 or later. GitHub Actions uses Node.js 24.

```bash
npm ci
cp .env.example .env
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` to the existing project's URL and public anon key, then run:

```bash
npm run dev
```

The development server runs at `http://localhost:5173`. Administration is available at `/#/admin` and requires a valid Supabase account. Database permissions determine which accounts can review payments and edit campaign settings.

Without Supabase configuration, campaign data and payment services are unavailable. The application does not create substitute records or allow local administrator sign-in.

### Read-only design preview

```bash
npm run dev:preview
```

This explicitly selected development mode displays labeled sample contributions for layout review. It disables Supabase connections, payments, submissions, and administration. Sample records are held in memory and are never saved. Production builds cannot enable this mode.

## Data and access control

Supabase PostgreSQL stores campaign settings and payment submissions. Progress is calculated from approved contributions. Money is transferred through UPI or ThankYouVeryMuch; the website records payment details for manual verification.

The public funding target is configured in `src/config.ts` as $260. Legacy goal values in the database are preserved and do not override this target.

See [Database documentation](supabase/README.md) for storage details and the separate access control migration for an existing project. Deploying the website does not apply SQL migrations.

## Validation

```bash
npm run build
npm run test:runtime
npm run test:db
```

Runtime tests verify configuration and preview isolation. Database tests use a disposable PostgreSQL instance to verify access restrictions, public-field filtering, approval behavior, and preservation of existing records. Tests do not access the live database.

## Deployment

GitHub Actions deploys `main` and `master` to [GitHub Pages](https://hirero-exists.github.io/XiaomiPad8-CF/). Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in repository Actions secrets. Never expose a service-role key or account password in client code.

Optional payment defaults use `VITE_UPI_ID` and `VITE_INTERNATIONAL_PAYMENT_URL`. Saved campaign settings take precedence. The UPI QR code and app link use the active UPI ID. The legacy `developer@upi` seed placeholder falls back to the configured payment address.

This project is independent and is not affiliated with Xiaomi.
