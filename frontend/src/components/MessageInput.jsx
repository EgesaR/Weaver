import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { IoImages, IoLink } from "react-icons/io5";
import { X, Image, Send, Camera, FileText, FileCode, FolderCode, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";

const containerVariants = {
  hidden: { y: 100, opacity: 0 },
  show: {
    y: -60,
    opacity: 1,
    transition: {
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: 50, transition: { duration: 0.3 } },
};

const linkList = [
  { name: "Gallery", icon: <IoImages />, onClick: () => {} },
  {
    name: "Camera",
    icon: <Camera />,
    onClick: () => {},
  },
  {
    name: "Document",
    icon: <FileText />,
    onClick: () => {},
  },
  {
    name: "Code",
    icon: <FileCode />,
    onClick: () => {},
  },
  {
    name: "Project",
    icon: <FolderCode />,
    onClick: () => {},
  },
  {
    name: "Event",
    icon: <CalendarDays />,
    onClick: () => {},
  },
];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showList, setShowList] = useState(false);

  const fileInputRef = useRef();
  const containerRef = useRef();

  const { sendMessage, setTyping, selectedUser } = useChatStore();

  // Typing effect cleanup
  useEffect(() => {
    if (!selectedUser) return;
    return () => setTyping(false);
  }, [selectedUser]);

  // Click outside to close button row
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowList(false);
      }
    }

    if (showList) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showList]);

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

    await sendMessage({
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
    <div className="w-full relative flex flex-col justify-center px-2 pb-1 h-14 mt-1">
      {/* Animated Button Row */}
      <AnimatePresence>
        {showList && (
          <motion.div
            ref={containerRef}
            className="absolute bottom-14 left-1/2 bg-white p-4 px-8 rounded-full -translate-x-1/2 flex items-center justify-between gap-2 shadow-sm"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {linkList.map((link) => (
              <motion.div
                key={link.name}
                variants={itemVariants}
                whileTap={{ scale: 0.9 }}
                className="pointer-events-auto"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full p-2 text-orange-500 border-orange-400 hover:bg-orange-500 hover:text-white transition-all duration-300 ease-in-out shadow-sm"
                  onClick={link.onClick}
                >
                  {link.icon}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2 absolute -top-[50%] -translate-y-[70%] left-2.5">
          <div className="relative">
            <img
              src={imagePreview}
              alt="imagePreview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-300 flex items-center justify-center hover:bg-orange-400 text-white transition-colors duration-300 hover:cursor-pointer"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center justify-center gap-2 w-full h-12 rounded mx-auto bg-white p-3 py-1 relative z-10 shadow-sm"
      >
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full h-full resize-none p-3 text-gray-700 placeholder-gray-400 caret-orange-500 focus:outline-none"
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
          />
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <Button
              variant="outline"
              size="icon"
              type="button"
              className={`rounded-full p-2 ${
                imagePreview ? "text-emerald-500" : "text-zinc-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={22} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="p-2 bg-orange-300 hover:bg-orange-400 text-white rounded-full transition-colors duration-300"
              onClick={() => setShowList(!showList)}
            >
              <IoLink size={22} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              type="submit"
              disabled={!text.trim() && !imagePreview}
              className={`p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center text-white transition-all duration-300 ease-in-out ${
                text.trim() || imagePreview ? "w-24" : ""
              }`}
            >
              <Send size={22} />
              {text.trim() || imagePreview && <label>Send</label>}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
