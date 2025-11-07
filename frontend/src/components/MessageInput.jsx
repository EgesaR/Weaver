import {
  useRef,
  useState,
  useEffect
} from "react";
import {
  useChatStore
} from "../store/useChatStore";
import {
  X,
  Image,
  Send
} from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text,
    setText] = useState("");
  const [imagePreview,
    setImagePreview] = useState(null);
  const fileInputRef = useRef();
  const {
    sendMessage,
    setTyping,
    selectedUser
  } = useChatStore();

  useEffect(() => {
    if (!selectedUser) return;
    return () => setTyping(false); // stop typing when component unmounts
  },
    [selectedUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    await sendMessage( {
      text: text.trim(),
      image: fileInputRef.current?.files[0] || null,
    });

    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTyping(false);
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    setTyping(e.target.value.length > 0);
  };
  return (
    <div className="p-4 w-full border-t border-base-300 bg-base-100">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
            src={imagePreview}
            alt="imagePreview"
            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
          <button
            onClick={removeImage}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-300 flex items-center justify-center"
            type="button"
            >
            <X className="size-3" />
          </button>
        </div>
      </div>
    )}
    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
      <div className="flex-1 flex gap-2">
        <input
        type="text"
        className="w-full h-12 px-4 rounded-lg border border-base-300 focus:ring focus:ring-indigo-300"
        placeholder="Type a message..."
        value={text}
        onChange={handleTyping}
        />
      <input
      type="file"
      accept="image/*"
      className="hidden"
      ref={fileInputRef}
      onChange={handleImageChange}
      />
    <button
      type="button"
      className={`rounded-full p-2 ${imagePreview ? "text-emerald-500": "text-zinc-400"}`}
      onClick={() => fileInputRef.current?.click()}
      >
      <Image size={22} />
    </button>
  </div>
  <button
    type="submit"
    disabled={!text.trim() && !imagePreview}
    className="p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white"
    >
    <Send size={22} />
  </button>
</form>
</div>
);
};

export default MessageInput;