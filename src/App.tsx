import { Link, NavLink, Outlet, Route, Routes } from "react-router-dom";
import { KeycapMark } from "./components/Logo";
import { ToastHost } from "./components/Toast";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Learn from "./pages/Learn";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/SettingsPage";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? " active" : ""}`;

function AppShell() {
  return (
    <>
      <header className="app-header">
        <div className="container app-header-inner">
          <Link to="/" className="brand">
            <KeycapMark /> ScamGuard
          </Link>
          <nav className="app-nav" aria-label="Main">
            <NavLink to="/app" end className={navClass}>
              Review
            </NavLink>
            <NavLink to="/app/learn" className={navClass}>
              Learn
            </NavLink>
            <NavLink to="/app/settings" className={navClass}>
              Settings
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="container page">
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="learn" element={<Learn />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastHost />
    </>
  );
}
