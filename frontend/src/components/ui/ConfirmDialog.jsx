import { motion, AnimatePresence } from 'framer-motion';

// Lightweight confirm modal for destructive actions.
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  danger = true,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(42,1,35,0.5)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="surface"
            style={{ maxWidth: 420, width: '100%', padding: 28, textAlign: 'center' }}
          >
            <h3 style={{ color: 'var(--tyrian)', fontSize: 24, marginBottom: 10 }}>
              {title}
            </h3>
            {message && <p className="muted" style={{ marginBottom: 24 }}>{message}</p>}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={onCancel}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={danger ? { background: 'var(--danger)' } : undefined}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
