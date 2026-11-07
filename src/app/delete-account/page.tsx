import Link from "next/link";

export const metadata = { title: "Delete your account — Patchlet" };

// Same address as the privacy page. Keep these two in step.
const CONTACT_EMAIL = "awhs.family@gmail.com";
const UPDATED = "7 November 2026";

export default function DeleteAccount() {
  const mail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Delete my Patchlet account")}&body=${encodeURIComponent("Please delete my Patchlet account and all my data.\n\nThe email I signed up with: ")}`;
  return (
    <main className="legal">
      <Link href="/" className="btn">
        ‹ Back
      </Link>
      <h1>Delete your Patchlet account</h1>
      <p>
        <em>Patchlet app · Last updated: {UPDATED}</em>
      </p>
      <p>You can delete your Patchlet account and everything saved in it whenever you like. This can’t be undone.</p>

      <h2>How to delete it in the app</h2>
      <ol>
        <li>Open <b>Patchlet</b> and log in.</li>
        <li>Tap your round <b>profile picture</b> at the top right to open <b>Profile</b>.</li>
        <li>Scroll to the bottom and tap <b>Delete my account</b>.</li>
        <li>Type your password and tap <b>Delete everything</b>.</li>
      </ol>
      <p>
        Forgot your password? On the login screen tap <b>Forgot password?</b>, reset it from the email we send, then follow the steps above.
      </p>

      <h2>Can’t get into the app?</h2>
      <p>
        Email us from the address you signed up with and we will delete your account for you:{" "}
        <a href={mail}>{CONTACT_EMAIL}</a>. We’ll confirm by email once it’s done.
      </p>

      <h2>What is deleted</h2>
      <ul>
        <li>Your account (name, email address and login).</li>
        <li>All your scrapbook pages, including your cover and end page.</li>
        <li>All photos you added, their cut-outs and backgrounds, and your profile picture.</li>
        <li>Your streak history and settings stored with your account.</li>
      </ul>

      <h2>What is kept, and for how long</h2>
      <ul>
        <li>
          <b>Nothing stays in your account.</b> Once you delete it, your data is removed from our database and storage straight away.
        </li>
        <li>
          Our cloud provider (Google Firebase) may hold routine backup copies for a limited time before they are permanently erased,
          which can take up to 6 months. We can’t read or restore them.
        </li>
        <li>Images or PDFs you saved to your own phone or computer stay there. They are your files, so delete them yourself if you wish.</li>
        <li>If you email us a deletion request, we keep that email only as long as needed to handle it.</li>
      </ul>

      <p>
        More about how we handle data is in our <Link href="/privacy/">privacy policy</Link>.
      </p>
    </main>
  );
}
