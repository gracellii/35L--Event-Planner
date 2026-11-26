// Layout for the log in and sign up pages: headline, form card, and two
// decorative tickets on wide screens
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="deco-ticket deco-left" aria-hidden="true">
        <div className="deco-body">
          <span className="deco-title">Admit one</span>
          <span className="deco-sub">Planning team</span>
        </div>
        <div className="deco-stub">
          <span className="deco-hole" />
        </div>
      </div>

      <div className="deco-ticket deco-right" aria-hidden="true">
        <div className="deco-stub" />
        <div className="deco-body">
          <span className="deco-title">Save the date</span>
          <span className="deco-sub muted">RSVP open</span>
        </div>
      </div>

      <main className="auth-main">
        <h1 className="display">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
      </main>
    </div>
  )
}
