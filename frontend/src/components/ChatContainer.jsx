import {
  useChatStore
} from "../store/useChatStore";
import {
  useAuthStore
} from "../store/useAuthStore";
import {
  useEffect,
  useRef
} from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import {
  formatMessageTime
} from "../lib/utils";

// Helper to make sure all image URLs are absolute
const getFullUrl = (url) => {
  if (!url) return "/avatar.png";
  if (url.startsWith("http")) return url;

  let BASE_URL = "";
  const hostname = typeof window !== "undefined" ? window.location.hostname: "";

  if (hostname === "localhost") BASE_URL = "http://localhost:5001";
  else if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) BASE_URL = `http://${hostname}:5001`;
  else if (hostname.includes("cluster-") && hostname.includes("cloudworkstations.dev"))
    BASE_URL = `https://${hostname}`;
  else BASE_URL = `http://${hostname}:5001`;

  return `${BASE_URL}${url}`;
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    selectedUser,
    isMessagesLoading,
    typingUsers,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const {
    authUser
  } = useAuthStore();
  const messagesEndRef = useRef(null);

  // Load messages for selected user
  useEffect(() => {
    if (selectedUser?._id) getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  },
    [selectedUser?._id,
      getMessages,
      subscribeToMessages,
      unsubscribeFromMessages]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  },
    [messages,
      typingUsers]);

  if (isMessagesLoading)
    return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ChatHeader />
      <MessageSkeleton />
      <MessageInput />
    </div>
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-base-100">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isSender = message.senderId === authUser._id;
          return (
            <div key={message._id} className={`chat flex ${isSender ? "justify-end": "justify-start"}`}>
              <div className="flex items-end gap-2">
                {/* Receiver avatar */}
                {!isSender && (
                  <img
                  src={getFullUrl(selectedUser.profilePic)}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                  />
              )}

              {/* Chat bubble */}
              <div
                className={`chat-bubble p-3 rounded-lg max-w-[80%] ${
                isSender ? "bg-indigo-500 text-white": "bg-indigo-100 text-black"
                } break-words`}
                >
                {message.text && <p>
                  {message.text}
                </p>
                }

                {message.image && (
                  <img
                  src={getFullUrl(message.image)}
                  alt="Attachment"
                  className="mt-2 rounded-md max-w-[200px] object-contain"
                  />
              )}

              <time className="text-xs opacity-50 ml-auto block mt-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            {/* Sender avatar */}
            {isSender && (
              <img
              src={getFullUrl(authUser.profilePic)}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
              />
          )}
        </div>
        </div>
      );
    })}

  {/* Typing indicator */}
  {selectedUser && typingUsers[selectedUser._id] && (
    <div className="flex items-center gap-2">
      <img
      src={getFullUrl(selectedUser.profilePic)}
      alt="Avatar"
      className="w-10 h-10 rounded-full"
      />
    <div className="bg-gray-200 p-2 rounded-full text-sm italic">
      Typing...
    </div>
  </div>
)}

<div ref={messagesEndRef} />
</div>

<MessageInput />
</div>
);
};

export default ChatContainer;