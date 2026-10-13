import { useEffect, useRef, useState } from "react";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, setTyping, selectedUser } = useChatStore();
  const hasMessage = Boolean(text.trim() || imagePreview);

  useEffect(() => {
    if (!selectedUser) return undefined;
    return () => setTyping(false);
  }, [selectedUser, setTyping]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.onerror = () => toast.error("Could not preview this image");
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!hasMessage) return;

    const sent = await sendMessage({
      text: text.trim(),
      image: fileInputRef.current?.files?.[0] || null,
    });
    if (!sent) return;

    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTyping(false);
  };

  return (
    <div className="border-t bg-background/90 p-3 sm:px-6 sm:py-4">
      {imagePreview && (
        <div className="relative mb-3 inline-flex rounded-xl border bg-card p-1 shadow-sm">
          <img
            src={imagePreview}
            alt="Selected attachment preview"
            className="size-20 rounded-lg object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute -right-2 -top-2 size-7 rounded-full shadow-sm"
            aria-label="Remove image"
            onClick={removeImage}
          >
            <X />
          </Button>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 rounded-2xl border bg-card p-1.5 pl-3 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring/20"
      >
        <Input
          type="text"
          aria-label="Write a message"
          placeholder={`Message ${selectedUser?.fullName || ""}...`}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setTyping(Boolean(event.target.value.trim()));
          }}
          className="h-10 min-w-0 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`shrink-0 ${imagePreview ? "text-primary" : "text-muted-foreground"}`}
          aria-label="Attach image"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image />
        </Button>
        <Button
          type="submit"
          disabled={!hasMessage}
          className="h-10 shrink-0 rounded-xl px-3 sm:px-4"
        >
          <Send />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
