// A labelled input with its error (or hint) underneath
export default function Field({ label, name, error, hint, as: Input = 'input', ...props }) {
  const id = `field-${name}`
  const note = error || hint

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Input
        id={id}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={note ? `${id}-note` : undefined}
        {...props}
      />
      {note && (
        <p id={`${id}-note`} className={error ? 'field-error' : 'field-hint'}>
          {note}
        </p>
      )}
    </div>
  )
}
