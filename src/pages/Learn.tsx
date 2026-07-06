import { SCAM_GUIDE } from "../lib/learnContent";

export default function Learn() {
  return (
    <>
      <div className="rise">
        <p className="eyebrow">The guide</p>
        <h1>Know the scams by name</h1>
        <p className="muted" style={{ marginTop: 12 }}>
          Every trick below turns up in real screenshots. Read one a day, or read the “say it like
          this” lines out loud on your next phone call — that sentence is the whole point.
        </p>
      </div>

      <div className="guide-grid">
        {SCAM_GUIDE.map((g, i) => (
          <article key={g.id} className="guide-card rise" style={{ ["--i" as string]: Math.min(i, 8) }}>
            <div>
              <h3>{g.title}</h3>
              {g.aka.length > 0 && <p className="guide-aka">Also known as: {g.aka.join(", ")}</p>}
            </div>
            <p>{g.story}</p>
            <ul className="guide-flags">
              {g.redFlags.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className="guide-say">
              <b>Say it like this</b>
              {g.tellYourParent}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
