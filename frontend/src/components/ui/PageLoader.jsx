// Full-screen brand loader used as Suspense fallback / route guards.
export default function PageLoader() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 34,
            letterSpacing: 6,
            color: 'var(--tyrian)',
            fontWeight: 700,
          }}
        >
          ZYVORA
        </div>
        <div className="spinner" />
      </div>
    </div>
  );
}
