export default function ThemeToggle({ onThemeChange, theme }) {
  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="theme-toggle"
      type="button"
      onClick={() => onThemeChange?.(isDark ? "light" : "dark")}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {isDark ? "☾" : "☀"}
      </span>
      <span className="visually-hidden">{isDark ? "Dark mode" : "Light mode"}</span>
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
}
