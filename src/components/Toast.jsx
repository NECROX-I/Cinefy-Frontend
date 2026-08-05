export default function Toast({ message, error }) {
  if (!message) return null;

  return (
    <div
      className={`toast ${
        error ? "toast-error" : ""
      }`}
      role={error ? "alert" : "status"}
    >
      {message}
    </div>
  );
}