export default function LanguageToggle({ language, onLanguageChange, label = "Language" }) {
  return (
    <label className="language-toggle" aria-label={label}>
      <span aria-hidden="true">EN</span>
      <span className="language-toggle-control">
        <input
          type="checkbox"
          checked={language === "ko"}
          onChange={(event) => onLanguageChange?.(event.target.checked ? "ko" : "en")}
        />
        <span className="language-toggle-track" aria-hidden="true">
          <span className="language-toggle-thumb" />
        </span>
      </span>
      <span aria-hidden="true">KR</span>
    </label>
  );
}
