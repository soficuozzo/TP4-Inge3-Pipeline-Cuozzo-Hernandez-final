// App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';

// Components
import { Toast } from './components/Toast';
import { ConfirmModal, EditModal } from './components/Modals';
import { MessageCard, EmptyState, LoadingState } from './components/MessageComponents';
import { MessageForm } from './components/MessageForm';
import { LoadingSpinner } from './components/LoadingSpinner';

// Hooks
import { useDebounce } from './hooks/useDebounce';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [loading, setLoading] = useState({
    fetch: false,
    create: false,
    update: false,
    delete: false
  });
  const [toast, setToast] = useState(null);
  const [modals, setModals] = useState({
    confirm: { isOpen: false, messageToDelete: null },
    edit: { isOpen: false, messageToEdit: null }
  });
  const [inputError, setInputError] = useState('');
  
  //const apiUrl = import.meta.env.VITE_API_URL;
  const apiUrl = 'api/messages'; // Usar la ruta relativa para aprovechar el proxy de Vite
  const debouncedInput = useDebounce(newMessageContent, 300);

  // Validación en tiempo real del input
  useEffect(() => {
    if (debouncedInput.trim().length > 0 && debouncedInput.trim().length < 3) {
      setInputError('El mensaje debe tener al menos 3 caracteres');
    } else if (debouncedInput.length > 500) {
      setInputError('El mensaje no puede exceder 500 caracteres');
    } else {
      setInputError('');
    }
  }, [debouncedInput]);

  // Función para mostrar notificaciones
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // Gestión de loading states
  const setLoadingState = useCallback((operation, isLoading) => {
    setLoading(prev => ({ ...prev, [operation]: isLoading }));
  }, []);

  // useEffect para cargar los mensajes al iniciar
  useEffect(() => {
    readAllMessages();
  }, []);

  // Función optimizada para leer todos los mensajes
  const readAllMessages = useCallback(async () => {
    setLoadingState('fetch', true);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
      showToast('Mensajes cargados correctamente', 'success');
    } catch (error) {
      console.error('Error al leer los mensajes:', error);
      showToast('Error al cargar los mensajes. Verifique la conectividad.', 'error');
      setMessages([]);
    } finally {
      setLoadingState('fetch', false);
    }
  }, [apiUrl, showToast, setLoadingState]);

  // Función para crear un nuevo mensaje
  const createMessage = useCallback(async () => {
    const trimmedContent = newMessageContent.trim();
    
    if (!trimmedContent) {
      setInputError('El mensaje no puede estar vacío');
      return;
    }
    if (trimmedContent.length < 3) {
      setInputError('El mensaje debe tener al menos 3 caracteres');
      return;
    }
    if (trimmedContent.length > 500) {
      setInputError('El mensaje no puede exceder 500 caracteres');
      return;
    }

    setLoadingState('create', true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedContent }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newMessage = { id: Date.now(), message: trimmedContent };
      setMessages(prev => [...prev, newMessage]);
      
      setNewMessageContent('');
      setInputError('');
      showToast('Mensaje creado exitosamente', 'success');
    } catch (error) {
      console.error('Error al crear el mensaje:', error);
      showToast('Error al crear el mensaje. Intente nuevamente.', 'error');
    } finally {
      setLoadingState('create', false);
    }
  }, [newMessageContent, apiUrl, showToast, setLoadingState]);

  // Función para actualizar un mensaje
  const updateMessage = useCallback(async (id, newContent) => {
    setLoadingState('update', true);
    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newContent }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, message: newContent } : msg
      ));
      
      showToast('Mensaje actualizado correctamente', 'success');
      setModals(prev => ({ ...prev, edit: { isOpen: false, messageToEdit: null } }));
    } catch (error) {
      console.error('Error al actualizar el mensaje:', error);
      showToast('Error al actualizar el mensaje. Intente nuevamente.', 'error');
    } finally {
      setLoadingState('update', false);
    }
  }, [apiUrl, showToast, setLoadingState]);

  // Función para eliminar un mensaje
  const deleteMessage = useCallback(async (id) => {
    setLoadingState('delete', true);
    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setMessages(prev => prev.filter(msg => msg.id !== id));
      
      showToast('Mensaje eliminado correctamente', 'success');
      setModals(prev => ({ ...prev, confirm: { isOpen: false, messageToDelete: null } }));
    } catch (error) {
      console.error('Error al borrar el mensaje:', error);
      showToast('Error al eliminar el mensaje. Intente nuevamente.', 'error');
    } finally {
      setLoadingState('delete', false);
    }
  }, [apiUrl, showToast, setLoadingState]);

  // Handlers para modales
  const handleEditClick = useCallback((message) => {
    setModals(prev => ({ 
      ...prev, 
      edit: { isOpen: true, messageToEdit: message } 
    }));
  }, []);

  const handleDeleteClick = useCallback((message) => {
    setModals(prev => ({ 
      ...prev, 
      confirm: { isOpen: true, messageToDelete: message } 
    }));
  }, []);

  // Manejo de teclas para crear mensaje
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      createMessage();
    }
  }, [createMessage]);

  // Handler para cambio de contenido
  const handleContentChange = useCallback((e) => {
    setNewMessageContent(e.target.value);
  }, []);

  // Memoización de la lista de mensajes
  const messagesList = useMemo(() => {
    return messages.map((message) => (
      <MessageCard
        key={message.id}
        message={message}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
    ));
  }, [messages, loading, handleEditClick, handleDeleteClick]);

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <div className="card-container">
          {/* Header */}
          <div className="app-header">
            <h1 className="header-title">
              Sistema de Gestión de Mensajes
            </h1>
            <p className="header-subtitle">
              Plataforma empresarial para administración de contenido
            </p>
          </div>
          
          <div className="messages-section">
            {/* Formulario para crear nuevo mensaje */}
            <MessageForm
              messageContent={newMessageContent}
              onContentChange={handleContentChange}
              onSubmit={createMessage}
              onKeyPress={handleKeyPress}
              inputError={inputError}
              loading={loading.create}
            />

            {/* Lista de mensajes */}
            <div>
              <div className="messages-header">
                <h2 className="section-title">
                  Mensajes ({messages.length})
                </h2>
                <button
                  onClick={readAllMessages}
                  disabled={loading.fetch}
                  className="btn btn-ghost"
                >
                  {loading.fetch ? <LoadingSpinner size="small" /> : null}
                  <span>Actualizar</span>
                </button>
              </div>
              
              {loading.fetch ? (
                <LoadingState />
              ) : messages.length > 0 ? (
                <div className="messages-list">
                  {messagesList}
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ConfirmModal 
        isOpen={modals.confirm.isOpen}
        onConfirm={() => deleteMessage(modals.confirm.messageToDelete.id)}
        onCancel={() => setModals(prev => ({ ...prev, confirm: { isOpen: false, messageToDelete: null } }))}
        message={modals.confirm.messageToDelete?.message || ''}
      />
      
      <EditModal 
        isOpen={modals.edit.isOpen}
        onSave={(newContent) => updateMessage(modals.edit.messageToEdit.id, newContent)}
        onCancel={() => setModals(prev => ({ ...prev, edit: { isOpen: false, messageToEdit: null } }))}
        currentMessage={modals.edit.messageToEdit?.message || ''}
      />

      {/* Sistema de notificaciones */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;