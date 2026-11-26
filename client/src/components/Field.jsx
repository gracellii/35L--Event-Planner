// A labelled form input that shows its error message underneath.
export default function Field({ label, name, error, hint, as = 'input', ...props }) {
  const Tag = as;
  const id = `field-${name}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag
        id={id}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
