import { statusTone } from '../../utils/helpers';
import './StatusBadge.css';

// Colored pill for order / payment status.
export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge--${statusTone(status)}`}>
      {status}
    </span>
  );
}
