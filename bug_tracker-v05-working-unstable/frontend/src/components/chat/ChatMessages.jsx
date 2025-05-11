import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/userContext';
import { FaRobot, FaReply, FaPaperclip, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';

const ChatMessages = () => {
  const { activeChat, messages, loading, fetchMessages, hasMoreMessages, messagePage } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !loading.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading.messages]);

  // Handle scroll to load more messages
  const handleScroll = async () => {
    const container = containerRef.current;
    if (!container) return;
    
    // Load more when scrolled close to top
    if (hasMoreMessages && !loadingMore && container.scrollTop < 50) {
      setLoadingMore(true);
      
      // Record current scroll height
      const scrollHeight = container.scrollHeight;
      
      // Fetch more messages
      await fetchMessages(activeChat._id, messagePage + 1);
      
      // Restore scroll position
      setTimeout(() => {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - scrollHeight;
        setLoadingMore(false);
      }, 100);
    }
  };

  // Format message timestamp
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  // Check if message belongs to current user
  const isOwnMessage = (message) => {
    return message.sender?._id === user?._id;
  };

  // Render attachment
  const renderAttachment = (attachment) => {
    const { mimetype, path, filename } = attachment;
    
    if (mimetype.startsWith('image/')) {
      return (
        <a 
          href={`http://localhost:5000/${path}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block mt-1 max-w-xs"
        >
          <img 
            src={`http://localhost:5000/${path}`} 
            alt={filename} 
            className="rounded border border-gray-200 max-h-40 object-contain"
          />
        </a>
      );
    } else {
      return (
        <a 
          href={`http://localhost:5000/${path}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center mt-1 p-2 bg-gray-100 rounded"
        >
          <FaPaperclip className="mr-2 text-blue-500" />
          <span className="text-sm text-blue-500">{filename}</span>
        </a>
      );
    }
  };

  // Get message style based on type
  const getMessageStyle = (message) => {
    const own = isOwnMessage(message);
    const isAI = message.isAIMessage;
    
    let baseClasses = "mb-4 rounded-lg p-3 max-w-md overflow-hidden";
    
    if (isAI) {
      return `${baseClasses} bg-purple-50 border border-purple-100 text-gray-800`;
    } else if (own) {
      return `${baseClasses} bg-blue-500 text-white ml-auto`;
    } else {
      return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 p-4 overflow-y-auto"
    >
      {/* Loading more messages indicator */}
      {loadingMore && (
        <div className="flex justify-center p-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* No messages */}
      {!loading.messages && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>No messages yet</p>
          <p className="text-sm mt-1">Send a message to start the conversation</p>
        </div>
      )}
      
      {/* Messages list */}
      {messages.map((message) => (
        <div key={message._id} className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}>
          <div className={getMessageStyle(message)}>
            {/* Message header with sender info */}
            {!isOwnMessage(message) && !message.isAIMessage && (
              <div className="flex items-center mb-1">
                <span className="font-medium text-sm">{message.sender?.name}</span>
              </div>
            )}
            
            {/* AI Message indicator */}
            {message.isAIMessage && (
              <div className="flex items-center mb-1">
                <FaRobot className="text-purple-500 mr-1" />
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
            )}
            
            {/* Reply indicator */}
            {message.replyTo && (
              <div className="flex items-center text-xs bg-gray-200 dark:bg-gray-700 rounded p-1 mb-1">
                <FaReply className="mr-1" />
                <span className="truncate">
                  {message.replyTo.isDeleted 
                    ? 'This message was deleted' 
                    : `${message.replyTo.sender?.name || 'User'}: ${message.replyTo.content}`}
                </span>
              </div>
            )}
            
            {/* Message content */}
            <div className="whitespace-pre-wrap break-words">
              {message.isDeleted ? (
                <span className="italic text-gray-500">This message was deleted</span>
              ) : (
                message.content
              )}
            </div>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-1">
                {message.attachments.map((attachment, index) => (
                  <div key={index}>{renderAttachment(attachment)}</div>
                ))}
              </div>
            )}
            
            {/* Timestamp */}
            <div className={`text-xs mt-1 ${isOwnMessage(message) ? 'text-blue-200' : 'text-gray-500'}`}>
              {formatMessageTime(message.createdAt)}
              {message.isTemp && ' · Sending...'}
            </div>
          </div>
        </div>
      ))}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
      
      {/* Loading indicator */}
      {loading.messages && !loadingMore && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages; 