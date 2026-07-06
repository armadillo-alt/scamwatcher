import { Link } from "react-router-dom";
import { KeycapMark } from "../components/Logo";

export default function NotFound() {
  return (
    <main
      className="container"
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        textAlign: "center",
      }}
    >
      <KeycapMark size={40} />
      <h1>This page doesn’t exist.</h1>
      <div className="btn-row">
        <Link to="/" className="btn btn-quiet">
          Go to the front page
        </Link>
        <Link to="/app" className="btn btn-primary">
          Open the dashboard
        </Link>
      </div>
    </main>
  );
}
