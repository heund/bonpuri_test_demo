export default function LanguageToggle({ language, onLanguageChange, label = "Language" }) {
  return (
    <label className="language-select" aria-label={label}>
      <span className="visually-hidden">{label}</span>
      <select
        value={language}
        onChange={(event) => onLanguageChange?.(event.target.value)}
      >
        <option value="en">EN</option>
        <option value="ko">KR</option>
      </select>
    </label>
  );
}
