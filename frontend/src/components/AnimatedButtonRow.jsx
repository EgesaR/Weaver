import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { IoLink } from "react-icons/io5";
import { Send } from "lucide-react";
import { useEffect, useRef } from "react";

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

export default function AnimatedButtonRow({ linkList, showList, setShowList }) {
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowList(false);
      }
    }

    if (showList) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showList, setShowList]);

  return (
    <div className="w-full relative flex flex-col items-center justify-center px-2 pb-1 h-14">
      {/* Animated button row behind the form */}
      <AnimatePresence>
        {showList && (
          <motion.div
            ref={containerRef}
            className="absolute bottom-0 left-1/2 bg-white p-4 px-8 rounded-full -translate-x-1/2 h-14 w-[70%] flex items-center justify-between gap-2"
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

      {/* Form on top */}
      <form className="w-full h-12 flex items-center justify-center gap-2 rounded mx-auto bg-white p-3 py-1 relative z-10 shadow-sm">
        <input
          type="text"
          placeholder="Type here a message..."
          className="h-full w-full resize-none rounded p-3 text-gray-700 placeholder-gray-400 caret-orange-500 focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Link"
            type="button"
            className="p-2 bg-orange-300 hover:bg-orange-400 text-white rounded-full transition-colors duration-300"
            onClick={() => setShowList(!showList)}
          >
            <IoLink size={22} />
          </Button>
          <button
            type="submit"
            className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white transition-colors duration-300"
          >
            <Send size={22} />
          </button>
        </div>
      </form>
    </div>
  );
}
