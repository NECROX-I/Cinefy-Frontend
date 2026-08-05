export default function Toast({ message, error }) {
  if (!message) return null;

  return (
    <div className={`toast ${error ? "toast-error" : ""}`}>
      {message}
    </div>
  );
}