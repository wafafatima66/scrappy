# Google Analytics for the Patchlet website: set-up and how to read it

The website tracks visits with Google Analytics 4 (GA4). The Android app does not use it.
Visitors see a small "Allow / No thanks" bar. Analytics cookies only start if they tap Allow.

## 1. Switch it on (one time)

1. Go to https://analytics.google.com and sign in with your Google account.
2. **Admin** (gear, bottom left) → **Create** → **Account**. Name it "Patchlet", then **Next**.
3. Create a **Property**: name "Patchlet website", pick your time zone and currency, then **Next → Create**.
4. Choose **Web** as the platform. Enter your website address (your Vercel address) and a stream name "Patchlet site". Click **Create stream**.
5. Copy the **Measurement ID**. It looks like `G-ABC123XYZ9`.
6. In **Vercel** → your project → **Settings → Environment Variables**, add:
   - Name: `NEXT_PUBLIC_GA_ID`
   - Value: your Measurement ID
   - Environments: Production (and Preview if you like)
7. **Redeploy** (Deployments → the latest → ⋯ → Redeploy). The ID is built into the site, so a redeploy is required.
8. Optional but useful: also add `NEXT_PUBLIC_SITE_URL` (your final website address, no slash at the end) so share previews and the sitemap use the right address.
9. For local testing, put `NEXT_PUBLIC_GA_ID=G-ABC123XYZ9` in `.env.local`.

**Check it works:** open your website, tap **Allow** on the bar, then in Analytics go to **Reports → Realtime**. You should see yourself within a minute.

## 2. Make links that show where people came from (Instagram vs search vs direct)

Add `?utm_source=...` to the link you share. Examples (replace with your address):

| Where you share it | Link to use |
| --- | --- |
| Instagram bio | `https://YOUR-SITE/?utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| Instagram story / reel link | `https://YOUR-SITE/?utm_source=instagram&utm_medium=social&utm_campaign=story` |
| WhatsApp | `https://YOUR-SITE/?utm_source=whatsapp&utm_medium=social&utm_campaign=share` |
| Email | `https://YOUR-SITE/?utm_source=email&utm_medium=email&utm_campaign=launch` |

The landing page remembers this for the visit and also passes it to Google Play when the person taps **Get it on Google Play**.

## 3. Where to look

**Website visitors by source**
- Analytics → **Reports → Acquisition → Traffic acquisition**
- The table shows **Session default channel group**:
  - **Direct**: typed the address, used a bookmark, or the link had no source.
  - **Organic Search**: came from Google, Bing, etc.
  - **Organic Social**: came from Instagram, Facebook, etc.
  - **Referral**: came from another website.
- To see the exact name (like instagram), click the small arrow next to the first column and choose **Session source / medium**. Links with UTM tags show as `instagram / social`.
- Instagram's in-app browser sometimes hides where the person came from. Without a UTM tag they may show as Direct. Always use the UTM links above.

**Did they click the Play Store or try the web version?**
- Analytics → **Reports → Engagement → Events**. Look for:
  - `play_store` (tapped Get it on Google Play)
  - `try_web` (tapped Try it on the web)
  - `request_access` (tapped Ask for early access)
  - `join_testers` (tapped Become a tester, only when that link is set)
- Click an event to see which part of the page it came from (`placement`: hero, header, get, footer).
- To see source and event together: **Explore** (left bar) → **Blank** → add Dimensions *Session source / medium* and *Event name*, and Metric *Event count*.
- Tip: Admin → **Events** → switch **Mark as key event** on `play_store` so it is counted as a goal.

**Did they install from Google Play?**
- Play Console → **Statistics** (or **Grow users → Store performance**) → **Acquisition** → store listing visitors by **UTM source**.
- Google Analytics can't see installs. Play Console shows how many people opened the store listing and how many installed, grouped by the `utm_source` you used.

## 4. A note on the numbers
- People who tap **No thanks** are mostly not counted, so real visits are a bit higher than you see.
- Data shows up in Realtime within a minute, but in normal reports after about a day.
