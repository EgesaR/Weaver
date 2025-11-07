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

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    selectedUser,
    isMessagesLoading,
    typingUsers,
    subscribeToMessages,
    unsubscribeFromMessages
  } = useChatStore();
  const {
    authUser
  } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) getMessages(selectedUser._id);
    subscribeToMessages()
    return () => unsubscribeFromMessages()
  },
    [selectedUser?._id,
      getMessages]);

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
                {!isSender && (
                  <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                  />
              )}
              <div className="chat-bubble p-3 rounded-lg max-w-[80%] bg-indigo-100 text-black break-words">
                {message.text && <p>
                  {message.text}
                </p>
                }
                {message.image && (
                  <img src={message.image} alt="Attachment" className="mt-2 rounded-md max-w-[100px]" />
              )}
              <time className="text-xs opacity-50 ml-auto block mt-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            {isSender && (
              <img
              src={authUser.profilePic || "/avatar.png"}
              alt="Avatar"
              className="size-8 rounded-full object-cover"
              />
          )}
        </div>
        </div>
      );
    })}
  {/* Typing indicator */}
  {selectedUser && typingUsers[selectedUser._id] && (
    <div className="flex items-center gap-2">
      <img src={selectedUser.profilePic || "/avatar.png"} alt="Avatar" className="w-10 h-10 rounded-full" />
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