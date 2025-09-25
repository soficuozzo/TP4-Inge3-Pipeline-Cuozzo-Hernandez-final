// components/Toast.jsx
import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from './Icons';

export const Toast = ({ message, type, onClose }) => {
  const toastClass = type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${toastClass} animate-slide-in`}>
      <Icon className="icon" />
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">
        <X className="icon-sm" />
      </button>
    </div>
  );
};