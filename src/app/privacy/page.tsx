import Link from "next/link";

export const metadata = { title: "Privacy policy — Patchlet" };

// Replace CONTACT_EMAIL and the date before you publish to the Play Store.
const CONTACT_EMAIL = "your-email@example.com";
const UPDATED = "25 October 2026";

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
          <b>Your scrapbook pages:</b> the pages you create, including any photos you add and your optional profile photo.
        </li>
        <li>
          <b>Streak information:</b> the days you made a page, used to show your streak and send reminders.
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
        Your pages and photos are kept on your device and, when you are signed in, in Google Firebase (Authentication, Cloud Firestore and Cloud Storage). Only you can access your own data. Firebase may process data on servers outside your country.
      </p>

      <h2>Photos and permissions</h2>
      <p>
        The app asks to read a photo only when you choose one to add to a page or use as your profile picture. It asks permission to show notifications only for streak reminders.
      </p>

      <h2>Ads</h2>
      <p>
        The app may show ads from Google AdMob. AdMob may collect device identifiers and usage data to show and measure ads. Where required, you will be asked for consent before personalised ads are shown. You can reset or limit your advertising ID in your Android settings.
      </p>

      <h2>Children</h2>
      <p>The app is not directed to children under 13, and we do not knowingly collect information from them.</p>

      <h2>Deleting your data</h2>
      <p>
        You can delete your account and all saved pages and photos at any time in the app: <b>Profile → Delete my account</b>. You can also email us at {CONTACT_EMAIL} and we will delete it for you.
      </p>

      <h2>Contact</h2>
      <p>Questions? Email {CONTACT_EMAIL}.</p>
    </main>
  );
}
