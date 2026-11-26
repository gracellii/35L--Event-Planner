// Shared frame for the Log in and Create account pages: big headline,
// a short line under it, the form card, and two decorative tickets.
export default function AuthShell({ title, lede, children }) {
  return (
    <div className="auth-page">
      <div className="deco-ticket deco-left" aria-hidden="true">
        <div className="deco-body" style={{ background: 'var(--blue)', borderRadius: '16px 0 0 16px' }}>
          <span className="deco-title">Admit one</span>
          <span className="deco-sub">Planning team</span>
        </div>
        <div
          style={{
            width: 64,
            background: 'var(--gold)',
            borderLeft: '2px dashed var(--ink)',
            borderRadius: '0 16px 16px 0',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <span style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--ink)' }} />
        </div>
      </div>

      <div className="deco-ticket deco-right" aria-hidden="true">
        <div style={{ width: 60, background: 'var(--ink)', borderRight: '2px dashed var(--bg)', borderRadius: '16px 0 0 16px' }} />
        <div className="deco-body" style={{ background: 'var(--surface)', borderRadius: '0 16px 16px 0' }}>
          <span className="deco-title">Save the date</span>
          <span className="deco-sub muted">RSVP open</span>
        </div>
      </div>

      <main className="auth-main">
        <h1 className="display">{title}</h1>
        <p className="auth-lede">{lede}</p>
        {children}
      </main>
    </div>
  );
}
