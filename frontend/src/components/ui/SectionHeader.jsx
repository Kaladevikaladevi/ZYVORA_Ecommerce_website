// Centered luxury section heading with an eyebrow + flourish.
export default function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="section-head">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2>{title}</h2>
      <div className="flourish" style={{ margin: '14px 0 6px' }}>✦</div>
      {text && <p>{text}</p>}
    </div>
  );
}
