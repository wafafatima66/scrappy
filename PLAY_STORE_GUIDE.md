# Patchlet: from this folder to the Play Store

Everything is in `D:\Scrapbook App\web`. The same code is the website **and** the Android app
(the app is the website packaged with Capacitor). Follow the parts in order.

---

## Part 1 · Firebase (login, profile photo, cloud backup) , about 15 minutes

1. Go to <https://console.firebase.google.com> → **Add project** → name it `patchlet` (turn Google Analytics off for now).
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
3. **Build → Firestore Database → Create database** → *Production mode* → pick the region nearest your users.
   Then open the **Rules** tab, paste the contents of `firestore.rules` from this folder, **Publish**.
4. **Build → Storage → Get started** → production mode → same region.
   Open **Rules**, paste `storage.rules`, **Publish**.
   (Storage may ask you to upgrade to the pay-as-you-go *Blaze* plan. You still get the free allowance; add a budget alert of a few dollars.)
5. **Project settings (⚙) → Your apps → Web (`</>`)** → register app `patchlet-web` → copy the `firebaseConfig` values.
6. In this folder copy `.env.local.example` to `.env.local` and paste the six values.
7. **Authentication → Settings → Authorized domains**: add your website domain once you have one (e.g. `patchlet.vercel.app`). `localhost` is already there.

Test it: `npm run dev` → open <http://localhost:3000> → create an account → add something to a page → check
Firebase console → Firestore → `users/<your id>/pages` appears.
(With no `.env.local` the app runs in *local mode*: name only, no login.)

## Part 2 · Run it on your phone

Install **Android Studio** (<https://developer.android.com/studio>), open it once so it downloads the Android SDK.

```bash
npm run android:sync     # builds the site and copies it into the Android project
npm run android:open     # opens the project in Android Studio
```

In Android Studio: plug in your phone (USB debugging on) or create an emulator, then press the green ▶ **Run**.
Re-run `npm run android:sync` after every code change.

Check on the phone: sign-up, add a page, **Save → Save page as image** (opens the share sheet), the daily reminder
(Profile → Streak reminder, allow notifications), profile photo, flip-through.

## Part 3 · Make the release file (.aab)

1. **Change the app id if you want** (it can never change after upload): `capacitor.config.ts` → `appId`, and
   `android/app/build.gradle` → `applicationId` (they must match, e.g. `com.yourname.patchlet`). Then `npm run android:sync`.
2. Every update: raise `versionCode` (1 → 2 → 3 …) and `versionName` in `android/app/build.gradle`.
3. Android Studio → **Build → Generate Signed App Bundle / APK → Android App Bundle** →
   **Create new…** keystore. **Back the keystore file and passwords up somewhere safe** (cloud drive + USB). Losing it blocks updates.
   Choose **release**, finish. The file appears in `android/app/release/app-release.aab`.
4. Keep Play App Signing turned on (default) when Play asks.

## Part 4 · Play Console

1. <https://play.google.com/console> → pay the one-time **$25** → verify identity (ID document; can take a few days).
   Choose **Personal** account unless you have a registered business.
2. **Create app** → name *Patchlet* → App · Free · accept policies.
3. **Test first (required for new personal accounts):** *Testing → Closed testing* → create track → upload the `.aab` →
   add **at least 12 testers** (their Gmail addresses, as a Google Group or email list) → they must opt in and keep the app
   installed for **14 days** → then **Apply for production access**.
4. Fill in **Dashboard → Set up your app** (all of these must be green):
   - **Privacy policy URL** → deploy the website (Part 5) and use `https://YOUR-SITE/privacy/`. First edit
     `src/app/privacy/page.tsx`: set `CONTACT_EMAIL`.
   - **App access**: say the app needs login and give a **test account** (create one in the app, e.g. `review@yourdomain.com` + password).
   - **Ads**: choose *No, my app does not contain ads* for now (change it when you add AdMob).
   - **Content rating**: questionnaire → likely *Everyone*.
   - **Target audience**: 13+ (avoids the stricter children's rules).
   - **Data safety**: Collected: *Name, Email, Photos, Other user content (pages)* · purpose *App functionality, Account management* ·
     encrypted in transit: yes · users can request deletion: yes. When AdMob is added also tick *Device or other IDs* for advertising.
   - **Account deletion** (required because the app creates accounts): in-app path is *Profile → Delete my account*.
     Play also asks for a web link: use the privacy page URL and mention the steps there (already included).
   - **Government / financial / health apps**: No.
5. **Store listing** (*Grow → Store presence → Main store listing*):
   - Short description (80 chars), full description (up to 4000).
   - **App icon 512×512 PNG** (export `assets/icon-only.png` resized to 512), **feature graphic 1024×500**,
     **2–8 phone screenshots** (take them from the emulator), and tablet screenshots (7" and 10") recommended.
6. When the closed test is done: *Production → Create release →* same `.aab` (or newer) → Review → **Start rollout**.
   First review usually takes a few days.

## Part 5 · Put the website online (also needed for the privacy page)

1. Push this folder to a GitHub repository (the `.gitignore` already hides `.env.local`, keystores and build output).
2. <https://vercel.com> → **New project** → import the repo → add the six `NEXT_PUBLIC_FIREBASE_…` values under
   *Environment variables* → Deploy.
3. Add the Vercel domain to Firebase *Authorized domains* (Part 1, step 7).

## Part 6 · Later: ads (AdMob), only when you want them

- Save-as-PDF / print already call `beforeExport()` in `src/lib/ads.ts`. Show an interstitial or rewarded ad there.
- Add the plugin: `npm i @capacitor-community/admob`, create the app + ad units at <https://admob.google.com>
  (use **test ad IDs** while developing; never click your own live ads), add your AdMob *App ID* to `AndroidManifest.xml`.
- Add Google's consent form (UMP) for EU/UK users, switch the Play Console *Ads* answer to **Yes**, and update Data safety (advertising ID).
- AdMob payments need an address PIN mailed by Google and a tax profile; check the payment methods your AdMob account offers.

## Handy facts

| Thing | Where |
|---|---|
| Elements (tape, flowers, stamps …) | `src/lib/procedural*.ts`, listed in `src/lib/catalog.ts` |
| Realistic cutout packs (later) | `public/packs/manifest.json` |
| Streak reminder text and schedule | `src/lib/notify.ts` |
| Click sound | `src/lib/sound.ts` |
| Colors, sizes | `src/app/globals.css` |
| App name / id | `capacitor.config.ts`, `android/app/build.gradle`, `android/app/src/main/res/values/strings.xml` |
| Icons | `assets/` then `npm run android:icons` |
