import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

// Read-only star rating display.
export default function Rating({ value = 0, count, size = 14 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) stars.push(<FaStar key={i} />);
    else if (value >= i - 0.5) stars.push(<FaStarHalfAlt key={i} />);
    else stars.push(<FaRegStar key={i} />);
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        color: 'var(--gold)',
        fontSize: size,
      }}
    >
      {stars}
      {count !== undefined && (
        <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 5 }}>
          ({count})
        </span>
      )}
    </span>
  );
}
