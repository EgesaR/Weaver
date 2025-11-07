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
      <div className="flex items-center justify-center pt-[68px] px-0.5">
        <div className="bg-base-100 rounded-lg flex w-full max-w-6xl overflow-hidden h-[calc(100vh-4.3rem)]">
          <Sidebar />
          {!selectedUser ? <NoChatSelected />: <ChatContainer />}
        </div>
      </div>

    </div>
  );
};

export default HomePage;