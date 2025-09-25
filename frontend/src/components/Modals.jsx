// components/Modals.jsx
import { useState, useEffect } from 'react';

export const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Confirmar eliminación</h3>
        <p className="modal-message">¿Está seguro de que desea eliminar este mensaje?</p>
        <p className="modal-preview">"{message}"</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export const EditModal = ({ isOpen, onSave, onCancel, currentMessage }) => {
  const [editContent, setEditContent] = useState(currentMessage || '');
  const [isValidContent, setIsValidContent] = useState(true);

  useEffect(() => {
    setEditContent(currentMessage || '');
    setIsValidContent(true);
  }, [currentMessage, isOpen]);

  const handleSave = () => {
    const trimmedContent = editContent.trim();
    if (trimmedContent.length < 3) {
      setIsValidContent(false);
      return;
    }
    if (trimmedContent.length > 500) {
      setIsValidContent(false);
      return;
    }
    onSave(trimmedContent);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Editar mensaje</h3>
        <textarea
          value={editContent}
          onChange={(e) => {
            setEditContent(e.target.value);
            setIsValidContent(true);
          }}
          onKeyPress={handleKeyPress}
          placeholder="Ingrese el contenido del mensaje..."
          className={`modal-textarea ${!isValidContent ? 'error' : ''}`}
          maxLength={500}
        />
        <div className="input-meta">
          <span className={`char-counter ${editContent.length > 450 ? 'warning' : ''}`}>
            {editContent.length}/500
          </span>
          {!isValidContent && (
            <span className="error-message">
              El mensaje debe tener entre 3 y 500 caracteres
            </span>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={!editContent.trim()}
            className="btn btn-primary"
          >
            Guardar
          </button>
        </div>
        <p className="form-tip">Tip: Usa Ctrl+Enter para guardar rápidamente</p>
      </div>
    </div>
  );
};