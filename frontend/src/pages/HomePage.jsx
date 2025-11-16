import {
  useChatStore
} from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import {
  useState
} from "react";
import {
  Menu,
  X
} from "lucide-react";

const HomePage = () => {
  const {
    selectedUser
  } = useChatStore();
  const [sidebarOpen,
    setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-neutral-200">
      <div className="flex items-center justify-center pt-[68px] px-4.5">
        <div className="bg-base-100 rounded-lg flex w-full max-w-7xl overflow-hidden h-[calc(100vh-4.3rem)] sm:h-[calc(100vh-70px)]">
          <Sidebar />
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;