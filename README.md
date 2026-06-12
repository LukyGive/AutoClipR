# AutoClip

AutoClip is a Twitch-first SaaS that lets streamers connect their account and automate clip creation.

This repository currently implements Phase 1 through Phase 6:

- Next.js 15 App Router
- TypeScript
- Tailwind
- Prisma with PostgreSQL
- Auth.js / NextAuth with Twitch OAuth
- Protected dashboard shell
- User profile persistence
- Database schema prepared for clips, rules and subscriptions
- Manual Twitch clip creation for a target Twitch channel through the official Helix Create Clip endpoint
- Clip persistence with status and error tracking
- Twitch chat worker that detects `!clip` and creates a clip for the target channel
- Dashboard rule configuration for cooldown, permissions, keywords and notifications
- Modular speech-to-text ingestion that triggers clips from configured keywords
- SaaS plans, usage quotas, analytics and Stripe billing

## Requirements

- Node.js 20.18+
- Docker
- A Twitch developer application

## Local setup

### Demo setup on macOS

This path lets you see AutoClip without real Twitch or Stripe credentials.

1. Install the required tools:

```bash
brew install node
brew install --cask docker
```

Open Docker Desktop once, then run:

```bash
npm run check:env
npm run demo:setup
npm run dev
```

Open `http://localhost:3000`, click login, then use **Entrer en démo**.

In demo mode:

- no real Twitch OAuth is required
- clip creation returns fake READY clips
- Stripe plan changes update the local database
- seeded analytics and speech-to-text events are visible immediately

You can also simulate a speech-to-text trigger:

```bash
curl -X POST http://localhost:3000/api/demo/speech
```

### Real integration setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Create a Twitch application and configure the OAuth callback:

```text
http://localhost:3000/api/auth/callback/twitch
```

4. Fill `AUTH_TWITCH_ID` and `AUTH_TWITCH_SECRET`.

5. Start Postgres:

```bash
npm run db:up
```

6. Generate Prisma Client and migrate:

```bash
npm run prisma:generate
npm run prisma:migrate
```

7. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

8. Start the Twitch chat worker in a second terminal when you want to listen for `!clip`:

```bash
npm run worker:chat
```

The worker refreshes configured target channels every 30 seconds, joins new targets,
leaves removed targets and reconnects to Twitch IRC with exponential backoff if the
socket closes. On each new connection it refreshes the Twitch OAuth token.

## Real chat command flow

1. Start the app with real Twitch credentials and sign in with Twitch.
2. Open the dashboard.
3. Add the target streamer login in **Streamer cible**.
4. Start the chat worker in a second terminal:

```bash
npm run worker:chat
```

5. Write the configured command, default `!clip`, in the target streamer's Twitch chat.

Keep the worker terminal open while testing. You should see logs such as
`Joined #streamer_login` and `Worker runtime ready`. If the Twitch connection drops,
the worker reconnects automatically.

AutoClip flow:

```text
target streamer chat
-> worker detects !clip
-> backend resolves the configured target
-> Twitch Helix Create Clip
-> backend polls Twitch Get Clips for confirmation
-> clip saved in the dashboard
```

The connected Twitch account must be allowed by Twitch to clip that channel. Twitch can still refuse if the channel is offline, clips are disabled, or your account is restricted on that channel.

## External button trigger

Each target streamer gets a secret external trigger URL in the dashboard:

```text
https://your-domain.com/api/triggers/external/<secret-token>
```

Calling this URL with `GET` or `POST` creates a clip for that target using the same backend rules, quotas and Twitch integration.

After Twitch returns a clip ID, AutoClip polls `Get Clips` for up to 15 seconds. The dashboard marks the clip `READY` only once Twitch confirms that the clip exists. If Twitch does not confirm it, the clip is saved as `FAILED` with `TWITCH_CLIP_CONFIRMATION_TIMEOUT`.

Use it with:

- Stream Deck HTTP request plugin
- OBS custom dock or browser source automation
- StreamElements / Nightbot custom command
- Make, Zapier or any webhook-capable tool

Treat the URL like a password. If it leaks, use **Régénérer le lien** in the dashboard.

## Architecture

The application uses a modular monolith layout. That keeps the first product fast to evolve while still separating domains cleanly enough to extract workers or services later.

- `src/app`: routes, layouts and server actions
- `src/features`: product domains such as auth, dashboard and users
- `src/lib`: shared infrastructure such as Prisma and environment validation
- `prisma`: database schema and migrations

## Phase boundaries

Phase 1 covers authentication, user management and dashboard shell.

Phase 2 covers manual Twitch clip creation from the dashboard.

The connected AutoClip user provides the OAuth user token with `clips:edit`. The dashboard asks for the Twitch login of the channel to clip, resolves it to a broadcaster ID through Helix, then calls `POST /helix/clips` with that broadcaster ID.

The target Twitch channel must be live for `POST /helix/clips` to create a usable clip. Twitch may also refuse if the target channel disabled clips, restricted clips to followers/subscribers, or banned/timed out the connected account. If Twitch refuses the request, AutoClip saves the failed request in the `Clip` table with an error code and message.

Phase 3 covers chat command detection for `!clip`.

The chat worker is a separate Node process. It loads `ClipTarget` rows from the database, connects to Twitch IRC WebSocket with the connected user's Twitch token, joins the target channels, and calls the same clip creation service used by the dashboard when it sees `!clip`.

The worker refreshes target channels every 30 seconds and automatically reconnects to Twitch IRC with exponential backoff if the socket closes. Each reconnect fetches a fresh Twitch access token when needed.

To create a `ClipTarget`, enter a Twitch channel login in the dashboard clip form once. The target is saved before the clip request is sent to Twitch.

The connected Twitch account must authorize both `clips:edit` and `chat:read`. If you authenticated before Phase 3 was added, sign out and sign in again so Twitch can grant the new chat scope.

Phase 4 covers dashboard configuration for the active automation rule:

- command name
- cooldown
- permission level
- keyword triggers
- natural-language speech instruction
- notification preference

The chat worker applies command, keyword, permission and cooldown settings when processing messages. Notification delivery is stored as a preference for now and will be wired to delivery channels in a later product phase.

Phase 5 covers the modular AI layer.

The current implementation exposes a secured transcript ingestion endpoint:

```text
POST /api/internal/speech/transcripts
```

Headers:

```text
x-autoclip-internal-key: <INTERNAL_API_KEY>
```

Body:

```json
{
  "userId": "autoclip-user-id",
  "broadcasterLogin": "target-channel-login",
  "transcript": "INCROYABLE action dans le live",
  "provider": "INTERNAL",
  "confidence": 0.92
}
```

If the transcript contains one of the configured rule keywords, AutoClip creates a clip with trigger type `SPEECH_TO_TEXT` and stores a `SpeechTranscriptEvent` audit row.

The rule form also accepts a natural-language instruction such as:

```text
clip quand je dis INCROYABLE ou GOAL
```

For now, AutoClip deterministically extracts keywords from that instruction and stores them on the rule. Later, this parser can be replaced by a richer LLM-based intent parser without changing the transcript ingestion contract.

Provider integrations are isolated under `src/features/speech/providers`. Whisper, Deepgram or another engine can be added by implementing the `SpeechToTextProvider` interface and feeding produced segments into the transcript service.

Phase 6 covers the SaaS layer:

- Free, Pro and Business plans
- monthly clip and speech-to-text quotas
- dashboard usage and analytics
- Stripe Checkout for subscriptions
- Stripe Customer Portal
- signed Stripe webhook handling
- webhook idempotency through `StripeWebhookEvent`

Stripe webhook endpoint:

```text
POST /api/stripe/webhook
```

Recommended Stripe events:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
```

Configure these environment variables before enabling billing:

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_BUSINESS_PRICE_ID="price_..."
```
