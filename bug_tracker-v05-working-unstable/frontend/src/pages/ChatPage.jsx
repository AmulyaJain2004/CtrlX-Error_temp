import { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/userContext';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';
import CreateChatModal from '../components/chat/CreateChatModal';
import ChatSettingsModal from '../components/chat/ChatSettingsModal';
import { FaCog, FaPlus } from 'react-icons/fa';

const ChatPage = () => {
  const { user } = useAuth();
  const { activeChat, loading } = useChat();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Title for the chat section
  const chatTitle = activeChat ? activeChat.name : 'Select a chat';

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-80 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chats</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Create new chat"
            title="Create new chat"
          >
            <FaPlus className="text-blue-500" />
          </button>
        </div>
        <ChatSidebar />
      </div>

      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{chatTitle}</h2>
              {activeChat && (
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Chat settings"
                  title="Chat settings"
                >
                  <FaCog className="text-gray-500" />
                </button>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatMessages />
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <ChatInput />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-600 mb-2">No chat selected</h3>
              <p className="text-gray-500">
                Select an existing chat or create a new one to start messaging
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateChatModal onClose={() => setIsCreateModalOpen(false)} />
      )}
      
      {isSettingsModalOpen && activeChat && (
        <ChatSettingsModal 
          chat={activeChat} 
          onClose={() => setIsSettingsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default ChatPage; 