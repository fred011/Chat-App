import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null); // Reference to the bottom of the chat

  // State for selected message
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false); // For context menu

  // Store position of the context menu (for right-click)
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Dependency on messages, to trigger scrolling

  const handleContextMenu = (e, message) => {
    e.preventDefault(); // Prevent default context menu
    setSelectedMessage(message);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true); // Show custom context menu
  };

  const handleLongPressStart = (message) => {
    setSelectedMessage(message);
    setShowContextMenu(true); // Show context menu on long press
  };

  const handleLongPressEnd = () => {
    setShowContextMenu(false); // Hide context menu
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            onContextMenu={(e) => handleContextMenu(e, message)} // Right-click event
            onTouchStart={() => handleLongPressStart(message)} // Mobile long press
            onTouchEnd={handleLongPressEnd} // End long press
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />{" "}
        {/* This is where the chat will scroll to */}
      </div>

      <MessageInput />

      {/* Right-click context menu */}
      {showContextMenu && selectedMessage && (
        <div
          className="fixed"
          style={{
            top: `${contextMenuPosition.y}px`,
            left: `${contextMenuPosition.x}px`,
            zIndex: 50,
          }}
        >
          <div className="bg-white shadow-lg rounded-md p-2">
            {selectedMessage.senderId === authUser._id && (
              <>
                <button
                  className="w-full text-red-700 p-2"
                  onClick={() => {
                    deleteMessage(selectedMessage._id, true); // Delete for Everyone
                    setShowContextMenu(false);
                  }}
                >
                  Delete for Everyone
                </button>
                <button
                  className="w-full text-gray-700 p-2"
                  onClick={() => setShowContextMenu(false)} // Close context menu
                >
                  Cancel
                </button>
              </>
            )}
            {/* If the message is not from the user, hide Cancel button */}
            {selectedMessage.senderId !== authUser._id && (
              <button
                className="w-full text-gray-700 p-2"
                onClick={() => setShowContextMenu(false)} // Close context menu
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
