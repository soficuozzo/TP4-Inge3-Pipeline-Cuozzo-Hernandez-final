// components/MessageComponents.jsx
import { Edit2, Trash2, MessageIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

export const MessageCard = ({ message, loading, onEdit, onDelete }) => (
  <div className="message-card">
    <div className="message-content-wrapper">
      <div className="message-text-container">
        <p className="message-text">{message.message}</p>
        <span className="message-id">ID: {message.id}</span>
      </div>
      <div className="message-actions">
        <button 
          onClick={() => onEdit(message)}
          disabled={loading.update}
          className="btn btn-success"
        >
          {loading.update ? <LoadingSpinner size="small" /> : <Edit2 className="icon-sm" />}
          <span className="action-btn-text">Editar</span>
        </button>
        <button 
          onClick={() => onDelete(message)}
          disabled={loading.delete}
          className="btn btn-danger"
        >
          {loading.delete ? <LoadingSpinner size="small" /> : <Trash2 className="icon-sm" />}
          <span className="action-btn-text">Eliminar</span>
        </button>
      </div>
    </div>
  </div>
);

export const EmptyState = () => (
  <div className="empty-state">
    <MessageIcon className="empty-icon" />
    <p className="empty-title">No hay mensajes disponibles</p>
    <p className="empty-subtitle">Cree el primer mensaje para comenzar</p>
  </div>
);

export const LoadingState = () => (
  <div className="loading-container">
    <div className="loading-content">
      <LoadingSpinner size="large" />
      <p className="loading-text">Cargando mensajes...</p>
    </div>
  </div>
);