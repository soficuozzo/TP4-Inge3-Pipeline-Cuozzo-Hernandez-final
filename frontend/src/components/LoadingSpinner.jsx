// components/LoadingSpinner.jsx
import { Loader2 } from './Icons';

export const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClass = size === 'small' ? 'spinner-sm' : size === 'large' ? 'spinner-lg' : 'spinner-md';
  return <Loader2 className={`${sizeClass} animate-spin`} />;
};