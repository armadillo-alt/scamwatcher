import { Link } from "react-router-dom";
import { HeroKeycap, KeycapMark } from "../components/Logo";
import { SCAM_GUIDE } from "../lib/learnContent";

export default function Landing() {
  const preview = SCAM_GUIDE.slice(0, 3);

  return (
    <>
      <header className="land-header">
        <div className="container" style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Link to="/" className="brand">
            <KeycapMark /> ScamGuard
          </Link>
          <div style={{ marginLeft: "auto" }}>
            <Link to="/app" className="btn btn-quiet">
              Open the dashboard
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container hero">
          <div className="rise">
            <h1>One button. One less thing to worry about.</h1>
            <p className="lede">
              Your parent presses one red key when something on their screen feels wrong. You see
              it here — with a plain answer to “is this a scam?”
            </p>
            <div className="hero-cta">
              <Link to="/app" className="btn btn-primary btn-lg">
                Open the dashboard
              </Link>
              <a href="#how" className="btn btn-quiet btn-lg">
                See how it works
              </a>
            </div>
          </div>
          <div className="hero-key rise" style={{ ["--i" as string]: 2 }}>
            <HeroKeycap />
          </div>
        </section>

        <section className="land-section" id="how">
          <div className="container">
            <p className="eyebrow">How it works</p>
            <h2>Three steps, no jargon</h2>
            <div className="steps">
              <div className="step">
                <h3>They press the key</h3>
                <p>
                  A popup, a strange email, a “your account is locked” page — when in doubt, your
                  parent presses the red key instead of clicking anything.
                </p>
              </div>
              <div className="step">
                <h3>It lands here</h3>
                <p>
                  The screenshot arrives in this dashboard. The text is read and checked against
                  the tricks scammers actually use — pressure, impersonation, strange payments.
                </p>
              </div>
              <div className="step">
                <h3>You decide</h3>
                <p>
                  You see why it was flagged, in plain language. Mark it safe or scam, and save
                  what you’ll tell them on the phone.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="land-section">
          <div className="container">
            <p className="eyebrow">What it watches for</p>
            <h2>The tricks, named in plain language</h2>
            <div className="guide-grid">
              {preview.map((g) => (
                <div key={g.id} className="guide-card">
                  <div>
                    <h3>{g.title}</h3>
                    {g.aka.length > 0 && <p className="guide-aka">Also known as: {g.aka.join(", ")}</p>}
                  </div>
                  <p>{g.story}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <Link to="/app/learn" className="btn btn-quiet">
                Read the whole guide
              </Link>
            </div>
          </div>
        </section>

        <footer className="container land-foot">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <KeycapMark size={20} /> ScamGuard
          </span>
          <span>Built for families in South Africa. Everything stays on your device.</span>
        </footer>
      </main>
    </>
  );
}
