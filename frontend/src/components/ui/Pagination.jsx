import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Simple, accessible pager.
export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const nums = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  for (let i = start; i <= end; i++) nums.push(i);

  const btn = {
    minWidth: 40,
    height: 40,
    borderRadius: 10,
    border: '1.5px solid var(--line)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 600,
    color: 'var(--ink)',
    background: '#fff',
  };
  const active = {
    ...btn,
    background: 'var(--tyrian)',
    color: '#fff',
    borderColor: 'var(--tyrian)',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        marginTop: 44,
        flexWrap: 'wrap',
      }}
    >
      <button
        style={{ ...btn, opacity: page === 1 ? 0.4 : 1 }}
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <FaChevronLeft size={12} />
      </button>
      {start > 1 && <span style={{ ...btn, border: 'none' }}>…</span>}
      {nums.map((n) => (
        <button
          key={n}
          style={n === page ? active : btn}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      {end < pages && <span style={{ ...btn, border: 'none' }}>…</span>}
      <button
        style={{ ...btn, opacity: page === pages ? 0.4 : 1 }}
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  );
}
