import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { MessageCircle } from "lucide-react";
import EnhancedImage from "./EnhancedImage";

// Helper to make sure all image URLs are absolute
const getFullUrl = (url) => {
  if (!url) return "/avatar.png";
  if (url.startsWith("http")) return url;

  let BASE_URL = "";
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  if (hostname === "localhost") BASE_URL = "http://localhost:5001";
  else if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname))
    BASE_URL = `http://${hostname}:5001`;
  else if (
    hostname.includes("cluster-") &&
    hostname.includes("cloudworkstations.dev")
  )
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

  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);
  const selectedUserId = selectedUser?._id;

  // Load messages for selected user
  useEffect(() => {
    if (selectedUserId) getMessages(selectedUserId);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUserId,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typingUsers]);

  if (isMessagesLoading)
    return (
      <div className="flex flex-1 flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/20">
      <ChatHeader />
      <div className="flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-muted/20 to-background p-4 sm:p-6">
      {messages.length === 0 && (
        <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
            <MessageCircle className="size-6 text-primary" />
          </span>
          <p className="font-medium">Start the conversation</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Send a message to {selectedUser.fullName} to get things going.
          </p>
        </div>
      )}
      {messages.map((message) => {
        const isSender =
          String(message.senderId) === String(authUser?._id);
        return (
          <div
            key={message._id}
            className={`flex ${isSender ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex max-w-[85%] items-end gap-2 sm:max-w-[72%] ${isSender ? "flex-row-reverse" : ""}`}>
              <img
                src={getFullUrl(isSender ? authUser?.profilePic : selectedUser.profilePic)}
                alt=""
                className="mb-5 size-7 shrink-0 rounded-full object-cover ring-1 ring-border"
              />
              <div className={`min-w-0 ${isSender ? "items-end" : "items-start"} flex flex-col`}>
                <h5 className="mb-1 px-1 text-xs font-medium text-muted-foreground">
                  {isSender ? "You" : selectedUser.fullName}
                </h5>
                <div
                  className={`max-w-full overflow-hidden rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    isSender
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md border bg-card text-card-foreground"
                  }`}
                >
                  {message.text && (
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  )}
                  {message.image && (
                    <EnhancedImage
                      src={getFullUrl(message.image)}
                      alt="Message attachment"
                      className={`max-h-72 max-w-full rounded-lg object-contain ${
                        message.text ? "mt-2" : ""
                      }`}
                    />
                  )}
                </div>
                <time className="mt-1 px-1 text-[11px] text-muted-foreground">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
            </div>
          </div>
          );
        })}
        {/* Typing indicator */}
        {selectedUser && typingUsers[selectedUser._id] && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <img
              src={getFullUrl(selectedUser.profilePic)}
              alt="Avatar"
              className="size-7 rounded-full object-cover"
            />
            <div className="rounded-2xl border bg-card px-3 py-2 italic shadow-sm">
              Typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
