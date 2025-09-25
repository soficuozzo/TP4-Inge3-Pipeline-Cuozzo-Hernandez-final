// components/MessageForm.jsx
import { Plus } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

export const MessageForm = ({ 
  messageContent, 
  onContentChange, 
  onSubmit, 
  onKeyPress,
  inputError,
  loading 
}) => {
  const isDisabled = !messageContent.trim() || !!inputError || loading;

  return (
    <div className="form-section">
      <label className="form-label">
        Crear nuevo mensaje
      </label>
      <div className="form-wrapper">
        <div className="input-container">
          <textarea
            value={messageContent}
            onChange={onContentChange}
            onKeyPress={onKeyPress}
            placeholder="Ingrese el contenido del mensaje..."
            className={`textarea-input ${inputError ? 'error' : ''}`}
            maxLength={500}
          />
          <div className="input-meta">
            <span className={`char-counter ${messageContent.length > 450 ? 'warning' : ''}`}>
              {messageContent.length}/500
            </span>
            {inputError && (
              <span className="error-message">{inputError}</span>
            )}
          </div>
        </div>
        <button 
          onClick={onSubmit}
          disabled={isDisabled}
          className="btn btn-primary"
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Plus className="icon" />
          )}
          <span>Crear Mensaje</span>
        </button>
      </div>
      <p className="form-tip">
        Tip: Usa Ctrl+Enter para crear rápidamente
      </p>
    </div>
  );
};