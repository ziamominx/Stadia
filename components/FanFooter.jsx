import Link from "next/link";

export default function FanFooter() {
  return (
    <footer className="fan-footer">
      <div className="fan-footer-inner">
        <Link href="/" className="fan-footer-brand" aria-label="Stadia home">
          STADIA <span className="fan-header-brand-dot" aria-hidden="true" />
        </Link>
        <p>Every moment, connected.</p>
        <nav aria-label="Fan footer navigation">
          <Link href="/matches">Matches</Link>
          <Link href="/ticket">My Pass</Link>
          <Link href="/journey-planner">Plan Visit</Link>
        </nav>
      </div>
    </footer>
  );
}
