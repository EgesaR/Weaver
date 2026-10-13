import {
  useChatStore
} from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <main className="min-h-screen bg-gradient-to-br from-muted/60 via-background to-muted/40 px-3 pb-4 pt-20 sm:px-6 sm:pb-6">
      <div className="mx-auto flex h-[calc(100vh-6.25rem)] min-h-[32rem] max-w-7xl overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xl shadow-black/5">
          <Sidebar />
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </main>
  );
};

export default HomePage;