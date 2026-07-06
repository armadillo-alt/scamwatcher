import { useRef, useState } from "react";
import { toast } from "../components/Toast";
import {
  clearAllLocalData,
  exportReviews,
  importReviews,
  loadSettings,
  saveSettings,
} from "../lib/store";

export default function SettingsPage() {
  const [settings, setSettings] = useState(loadSettings);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = () => {
    if (settings.source === "sheet" && !settings.sheetCsvUrl.trim()) {
      toast("Add the sheet link first, or choose demo data.");
      return;
    }
    saveSettings(settings);
    toast("Settings saved");
    window.setTimeout(() => location.reload(), 500);
  };

  const doExport = () => {
    const blob = new Blob([exportReviews()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scamguard-reviews.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const count = importReviews(await file.text());
      toast(`Imported ${count} review${count === 1 ? "" : "s"}`);
      window.setTimeout(() => location.reload(), 500);
    } catch (e) {
      toast(e instanceof Error ? e.message : "That file couldn’t be imported.");
    }
  };

  const doClear = () => {
    if (window.confirm("Delete all reviews, notes and settings stored on this device?")) {
      clearAllLocalData();
      location.reload();
    }
  };

  return (
    <>
      <div className="rise">
        <p className="eyebrow">Settings</p>
        <h1>Data &amp; privacy</h1>
      </div>

      <div className="settings-stack">
        <section className="settings-card rise" style={{ ["--i" as string]: 1 }}>
          <h3>Where screenshots come from</h3>
          <label className="check">
            <input
              type="radio"
              name="source"
              checked={settings.source === "demo"}
              onChange={() => setSettings({ ...settings, source: "demo" })}
            />
            <span>
              <b>Demo data</b>
              <br />
              <span className="hint">Ten realistic examples. Works offline, nothing leaves this page.</span>
            </span>
          </label>
          <label className="check">
            <input
              type="radio"
              name="source"
              checked={settings.source === "sheet"}
              onChange={() => setSettings({ ...settings, source: "sheet" })}
            />
            <span>
              <b>A Google Sheet</b>
              <br />
              <span className="hint">
                The sheet your capture setup writes to, published to the web as CSV (File →
                Share → Publish to web). It’s a public link — no passwords or keys are involved,
                so never put private details in that sheet.
              </span>
            </span>
          </label>
          {settings.source === "sheet" && (
            <div className="field">
              <label htmlFor="sheet-url">Published CSV link</label>
              <input
                id="sheet-url"
                className="input"
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/e/…/pub?output=csv"
                value={settings.sheetCsvUrl}
                onChange={(e) => setSettings({ ...settings, sheetCsvUrl: e.target.value })}
              />
              <span className="hint">
                Columns it understands: id, screenshot_url, timestamp, parent_id, ocr_text.
              </span>
            </div>
          )}
          <div className="btn-row">
            <button className="btn btn-primary" onClick={save}>
              Save and reload
            </button>
          </div>
        </section>

        <section className="settings-card rise" style={{ ["--i" as string]: 2 }}>
          <h3>Reading text from images</h3>
          <label className="check">
            <input
              type="checkbox"
              checked={settings.ocrEnabled}
              onChange={(e) => setSettings({ ...settings, ocrEnabled: e.target.checked })}
            />
            <span>
              <b>Read the text on screenshots for me</b>
              <br />
              <span className="hint">
                Only runs on screenshots that arrive without text. The first time, it downloads a
                free text-reading engine (about 2&nbsp;MB) from the internet, then works from your
                browser’s cache. Your screenshots themselves are never uploaded anywhere.
              </span>
            </span>
          </label>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={save}>
              Save and reload
            </button>
          </div>
        </section>

        <section className="settings-card rise" style={{ ["--i" as string]: 3 }}>
          <h3>Your reviews</h3>
          <p className="hint">
            Verdicts, notes and guidance live only in this browser. Export them to move to another
            computer, or as a backup.
          </p>
          <div className="btn-row">
            <button className="btn btn-quiet" onClick={doExport}>
              Export reviews
            </button>
            <button className="btn btn-quiet" onClick={() => fileRef.current?.click()}>
              Import reviews
            </button>
            <button className="btn btn-danger" onClick={doClear}>
              Clear local data
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => {
              doImport(e.target.files?.[0]);
              // Reset so re-picking the same file (e.g. after a failed import) fires onChange again.
              e.target.value = "";
            }}
          />
        </section>
      </div>
    </>
  );
}
