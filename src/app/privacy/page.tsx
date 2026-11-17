import Link from "next/link";

export const metadata = { title: "Privacy policy — Patchlet" };

// Replace CONTACT_EMAIL and the date before you publish to the Play Store.
const CONTACT_EMAIL = "awhs.family@gmail.com";
const UPDATED = "21 November 2026";

export default function Privacy() {
  return (
    <main className="legal">
      <Link href="/" className="btn">
        ‹ Back
      </Link>
      <h1>Privacy policy</h1>
      <p>
        <em>Last updated: {UPDATED}</em>
      </p>
      <p>
        Patchlet (“the app”) is a scrapbook journal. This page explains what information the app uses and why. We keep it short and plain.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <b>Account details:</b> your name and email address, and a password (stored securely by Google Firebase Authentication; we never see your password).
        </li>
        <li>
          <b>Your scrapbook pages:</b> when you are signed in, each page you make is saved to your account as a single picture, so you can see it on your other devices. The photos you add to a page are not uploaded; they stay on the device you used. Your optional profile photo is saved on your account.
        </li>
        <li>
          <b>Streak information:</b> the days you made a page, used to show your streak and send reminders.
        </li>
        <li>
          <b>Usage statistics (only if you allow them):</b> in the Android app, if you tap “Allow”, Google Analytics for Firebase records how the app is used: app opens, which tools, layouts and exports are used, your device model, Android version, language and approximate country, and a random app instance ID. See “Usage statistics” below.
        </li>
        <li>
          <b>Advertising data:</b> if ads are shown (for example when you choose to save a PDF or print), the ad provider may use your device’s advertising ID. See “Ads” below.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To sign you in and keep your pages backed up so you can restore them on a new phone.</li>
        <li>To show your streak and send the daily reminder you can switch off in Profile.</li>
        <li>We do not sell your personal information.</li>
      </ul>

      <h2>Where it is stored</h2>
      <p>
        Your pages and photos are kept on your device and, when you are signed in, a picture of each page is kept in Google Firebase (Authentication and Cloud Firestore). Only you can access your own data. Firebase may process data on servers outside your country.
      </p>

      <h2>Photos and permissions</h2>
      <p>
        The app asks to read a photo only when you choose one to add to a page or use as your profile picture. It asks permission to show notifications only for streak reminders.
      </p>

      <h2>Usage statistics in the app</h2>
      <p>
        The first time you open the Android app we ask whether you want to share usage statistics. Until you tap “Allow”, nothing is collected. If you allow it, we use Google Analytics for Firebase to count things like how often the app is opened and which tools, page layouts and save options are used, so we can fix what is confusing and build what people use. We never send your name, email address, photos, or anything written on your pages, and the statistics are not linked to your account. They are tied to a random ID that Firebase creates for the app on your phone. We do not read your device’s advertising ID for this. You can switch statistics off or on at any time in <b>Profile → Share usage statistics</b>. Google keeps the statistics for a limited time, up to 14 months.
      </p>

      <h2>Website analytics</h2>
      <p>
        Our website uses Google Analytics to count visits and to see which links bring people to us (for example Instagram or a search). It records things like the page you opened, your approximate location, your device type and the site you came from. It does not collect your name or email address. Analytics cookies are only switched on if you tap “Allow” on the notice; you can say “No thanks” and the site works the same. The Android app has its own, optional setting described above.
      </p>

      <h2>Ads</h2>
      <p>
        The app may show ads from Google AdMob. AdMob may collect device identifiers and usage data to show and measure ads. Where required, you will be asked for consent before personalised ads are shown. You can reset or limit your advertising ID in your Android settings.
      </p>

      <h2>Children</h2>
      <p>The app is not directed to children under 13, and we do not knowingly collect information from them.</p>

      <h2>Deleting your data</h2>
      <p>
        You can delete your account and all saved pages and photos at any time in the app: <b>Profile → Delete my account</b>. Step-by-step instructions are on our <Link href="/delete-account/">delete account page</Link>. You can also email us at {CONTACT_EMAIL} and we will delete it for you.
      </p>

      <h2>Contact</h2>
      <p>Questions? Email {CONTACT_EMAIL}.</p>
    </main>
  );
}
