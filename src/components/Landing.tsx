import type React from "react";
import Link from "next/link";
import { PLAY_URL, TESTER_URL, accessMail, CONTACT_EMAIL } from "@/lib/site";
import HeroPages from "./HeroPages";
import NativeRedirect from "./NativeRedirect";
import TrackClicks from "./TrackClicks";

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M4 2.6v18.8c0 .5.5.8.9.5l16-9.4a.6.6 0 0 0 0-1L4.9 2.1c-.4-.3-.9 0-.9.5z" />
  </svg>
);

const PlayBtn = ({ place, label = "Get it on Google Play" }: { place: string; label?: string }) => (
  <a className="lp-btn play" href={PLAY_URL} data-play="" data-track="play_store" data-place={place} target="_blank" rel="noopener noreferrer">
    <PlayIcon /> {label}
  </a>
);

const WebBtn = ({ place, label = "Try it on the web" }: { place: string; label?: string }) => (
  <Link className="lp-btn ghost" href="/app/" data-track="try_web" data-place={place}>
    ✦ {label}
  </Link>
);

const FEATURES: { icon: string; title: string; text: string }[] = [
  { icon: "📅", title: "One page a day", text: "Today’s page is always ready. Open the app, start decorating, done. Older days stay in your book." },
  { icon: "🎀", title: "Hundreds of scrapbook elements", text: "Washi tape, torn and patterned paper, photo frames, borders and dividers, envelopes, tickets, country and date stamps, postage and seals, film strips, lace, doodles, tags and labels. Grouped so you find things fast." },
  { icon: "🖐", title: "Drag, resize, rotate", text: "Touch, pinch and turn anything on the page. Layer items on top of each other and bring any piece forward or send it back." },
  { icon: "🖼", title: "Your photos, your way", text: "Add photos as polaroids, plain prints or torn-edge prints. Cut people out with on-device AI, remove a plain background in one tap, or draw around anything with the scissors." },
  { icon: "🪄", title: "Change a photo’s background", text: "After a cutout, put the photo on a colour, a paper texture or another photo." },
  { icon: "Aa", title: "18 fonts, 12 text styles", text: "Handwriting, typewriter, marker, calligraphy and more, with neon glow, retro 3D, outline, sticker, rubber stamp, label maker, highlighter and others. Pick any colour you like." },
  { icon: "✎", title: "Draw and doodle", text: "Pens, markers and highlighters for your own scribbles, arrows and underlines." },
  { icon: "▤", title: "Paper, layouts and borders", text: "Plain or textured paper in light and dark colours, ready-made page layouts, and page borders like lace, stitching, film and torn edges." },
  { icon: "📖", title: "Your own cover and end page", text: "A cover and last page with your name on them, in a collage style you can change however you like." },
  { icon: "📚", title: "Flip through like a real book", text: "Page-turn animation for your whole journal. Delete pages you don’t want, reorder your days, keep the best." },
  { icon: "⬇", title: "Save, share, print", text: "Save any page as an image into your gallery, share it to WhatsApp or Instagram, or make a PDF of a page or the whole book, and print it." },
  { icon: "🔥", title: "Streaks and gentle reminders", text: "See how many days in a row you’ve made a page. A soft daily reminder helps the habit stick, and you can switch it off." },
  { icon: "☁", title: "Backup and sync", text: "Sign in with your email to back your pages up and see the same journal on your phone and your tablet. Your pages are yours and you can delete your account any time." },
];

const WHY: { icon: string; title: string; text: string }[] = [
  { icon: "⏱", title: "A five-minute reset", text: "Stepping away from the feed to make one page gives your mind a short, calm break between tasks, and it is finished in minutes." },
  { icon: "🎯", title: "Clearer priorities", text: "Writing down what happened and what matters helps you spot patterns, plan tomorrow and focus on what counts. Use a page as a daily planner, a wins list or a to-do board." },
  { icon: "🔁", title: "A habit that sticks", text: "One page a day, a streak counter and a gentle reminder turn “I should journal” into something you actually do." },
  { icon: "🎨", title: "Creativity on tap", text: "Tape, stamps, lace and doodles make reflecting fun, so you keep going, without the mess of glue and scissors." },
  { icon: "🧠", title: "Memories you can find again", text: "Pages are dated, backed up and in one place. Look back on a week, a trip or a whole year in a flip." },
  { icon: "🌿", title: "Screen time that feels good", text: "You make something instead of scrolling. No feed, no likes, no followers. Just your page." },
];

const USES = ["Daily planner", "Gratitude page", "Study log", "Travel diary", "Project journal", "Mood tracker", "Reading notes", "Family memories", "Goal board", "Recipe notes"];

const STEPS = [
  { n: "1", title: "Start today’s page", text: "Type your name once. It goes on your cover and end page. Today’s page opens right away." },
  { n: "2", title: "Decorate it", text: "Add tape, paper, stamps, photos and words. Move things around until it feels like you." },
  { n: "3", title: "Flip, save, share", text: "Flip through your book, save a page to your gallery, share it, or print the whole thing." },
];

const FAQ: { q: string; a: React.ReactNode }[] = [
  { q: "Is Patchlet free?", a: "Yes. You can make pages, use every element and save your work for free. Some gentle ads may appear later in a few places, for example when you save a PDF." },
  { q: "Do I need an account?", a: "No. You can start with just your name. If you sign in with your email, your pages are backed up and show up on all your devices, so you never lose them." },
  { q: "Which devices does it work on?", a: "Android phones and tablets through Google Play. There is also a web version you can try in any browser, which is handy for a quick look." },
  { q: "What is the difference between the web version and the Android app?", a: "The web version has the page editor, elements, text, photos and flipbook. The Android app adds the daily reminder, saving straight into your gallery and a smoother touch experience." },
  { q: "Is there an iPhone version?", a: "Not yet. For now, iPhone users can try the web version in Safari." },
  { q: "Who can see my pages?", a: "Only you. When you sign in, a picture of each page is saved under your own account. The photos you add stay on your own device. You can delete your account and everything in it whenever you want." },
  { q: "Why do I have to join the tester group first?", a: "Patchlet is in Google Play’s testing stage. Google asks new apps to be tried by a group of real people before a public launch. Testers get the app free and help us fix things before everyone else gets it." },
];

export default function Landing() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.filter((f) => typeof f.a === "string").map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a as string } })),
  };
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Patchlet",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Android, Web",
    description: "A digital scrapbook journal: make one page a day with tape, paper, stamps, lace, doodles and your photos.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <div className="lp">
      <NativeRedirect />
      <TrackClicks />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([appLd, faqLd]) }} />

      <header className="lp-head">
        <a href="#top" className="lp-logo">
          <span className="orb" /> Patchlet
        </a>
        <nav aria-label="Main">
          <a href="#features">Features</a>
          <a href="#why">Why Patchlet</a>
          <a href="#get">Get the app</a>
          <a href="#faq">FAQ</a>
        </nav>
        <PlayBtn place="header" label="Google Play" />
      </header>

      <main id="top">
        {/* ---------- hero ---------- */}
        <section className="lp-hero">
          <div className="lp-hero-text">
            <p className="lp-eyebrow">A scrapbook journal for your phone</p>
            <h1>
              One scrapbook page a day. <em>A calmer, more creative you.</em>
            </h1>
            <p className="lp-lead">
              Decorate a page with washi tape, torn paper, stamps, lace, doodles and your own photos. Build a habit, clear your head, and keep the little moments, without the glue and scissors.
            </p>
            <div className="lp-cta">
              <PlayBtn place="hero" />
              <WebBtn place="hero" />
            </div>
            <p className="lp-note">Free · Android phones and tablets · Web version to try right now</p>
          </div>
          <div className="lp-hero-art">
            <HeroPages mode="hero" />
          </div>
        </section>

        {/* ---------- what it is ---------- */}
        <section className="lp-sec lp-intro">
          <h2>Journaling that feels like play</h2>
          <p>
            Patchlet is a digital scrapbook. Every day you get one blank page. Fill it with tape and paper, a ticket from today’s trip, a photo, a doodle and a few words. Flip back through your book any time and see your days laid out like a real scrapbook.
          </p>
        </section>

        {/* ---------- gallery ---------- */}
        <section className="lp-sec" aria-label="Sample pages">
          <h2>What a page can look like</h2>
          <p className="lp-sub">These are real Patchlet pages, made with the same elements you get in the app.</p>
          <HeroPages mode="gallery" />
        </section>

        {/* ---------- features ---------- */}
        <section id="features" className="lp-sec">
          <h2>Everything in the app</h2>
          <p className="lp-sub">Simple to start, with plenty to play with once you do.</p>
          <div className="lp-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="lp-card">
                <span className="lp-ic" aria-hidden="true">
                  {f.icon}
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- why ---------- */}
        <section id="why" className="lp-sec lp-why">
          <h2>Why a daily page? Small habits add up.</h2>
          <p className="lp-sub">
            A page a day takes a few minutes, but many people find that a short daily reflection makes the rest of the day easier to handle. Here is what Patchlet is built to give you.
          </p>
          <div className="lp-grid">
            {WHY.map((f) => (
              <article key={f.title} className="lp-card soft">
                <span className="lp-ic" aria-hidden="true">
                  {f.icon}
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
          <h3 className="lp-uses-h">Ways people can use a page</h3>
          <ul className="lp-uses">
            {USES.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </section>

        {/* ---------- how ---------- */}
        <section id="how" className="lp-sec">
          <h2>How it works</h2>
          <ol className="lp-steps">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- get the app ---------- */}
        <section id="get" className="lp-sec lp-get">
          <h2>Get Patchlet</h2>
          <div className="lp-get-grid">
            <div className="lp-box">
              <h3>On Android (early access)</h3>
              <p>Patchlet is in Google Play’s testing stage right now. It takes about two minutes to join:</p>
              <ol>
                <li>
                  <b>Ask to join.</b> Tap the button below and send us the Gmail address you use on your Android phone. We add you to the testers list and reply with your join link.
                </li>
                <li>
                  <b>Accept the invite.</b> Open the link on your phone and tap <b>Become a tester</b>. You need to be signed in to Google Play with that Gmail.
                </li>
                <li>
                  <b>Install.</b> Tap <b>Get it on Google Play</b> and install Patchlet like any other app.
                </li>
                <li>
                  <b>Open it and start.</b> Type your name and your first page is ready.
                </li>
              </ol>
              <div className="lp-cta">
                <a className="lp-btn solid" href={accessMail} data-track="request_access" data-place="get">
                  ✉ Ask for early access
                </a>
                {TESTER_URL && (
                  <a className="lp-btn solid" href={TESTER_URL} target="_blank" rel="noopener noreferrer" data-track="join_testers" data-place="get">
                    Become a tester
                  </a>
                )}
                <PlayBtn place="get" />
              </div>
              <p className="lp-small">
                <b>Why the extra step?</b> Google asks new apps to be tried by real people before a public launch. As a tester you get Patchlet free, and your feedback shapes what comes next. The Play button works once you have joined.
              </p>
            </div>
            <div className="lp-box alt">
              <h3>Or try it on the web</h3>
              <p>Want a quick look first? Open the web version in your browser. No install, no sign-up needed to try it.</p>
              <ul>
                <li>The page editor, elements, text, photos, drawing and flipbook</li>
                <li>Save pages as images or PDFs to your downloads</li>
                <li>Reminders and saving straight to your gallery are in the Android app</li>
              </ul>
              <div className="lp-cta">
                <WebBtn place="get" label="Open the web version" />
              </div>
              <p className="lp-small">The web version is for trying things out. Your phone is the best place to make pages.</p>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section id="faq" className="lp-sec lp-faq">
          <h2>Questions</h2>
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        {/* ---------- closing ---------- */}
        <section className="lp-sec lp-final">
          <h2>Make your first page today.</h2>
          <p>It takes five minutes, and it’s yours to keep.</p>
          <div className="lp-cta center">
            <PlayBtn place="footer" />
            <WebBtn place="footer" />
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <span>© {new Date().getFullYear()} Patchlet</span>
        <nav aria-label="Footer">
          <Link href="/privacy/">Privacy</Link>
          <Link href="/delete-account/">Delete account</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
        </nav>
      </footer>
    </div>
  );
}
