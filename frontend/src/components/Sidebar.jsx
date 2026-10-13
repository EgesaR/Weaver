import {
  useChatStore
} from "../store/useChatStore";
import {
  useEffect,
  useState
} from "react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
  Users
} from "lucide-react";
import {
  useAuthStore
} from "../store/useAuthStore";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const ONLINE_ONLY_PREFERENCE_KEY = "weaver-show-online-only";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading
  } = useChatStore();
  const {
    onlineUsers
  } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(
    () => window.localStorage.getItem(ONLINE_ONLY_PREFERENCE_KEY) === "true"
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    window.localStorage.setItem(
      ONLINE_ONLY_PREFERENCE_KEY,
      String(showOnlineOnly)
    );
  }, [showOnlineOnly]);

  const onlineContacts = users.filter((user) =>
    onlineUsers.includes(String(user._id))
  );
  const visibleUsers = showOnlineOnly ? onlineContacts : users;
  const filteredUsers = visibleUsers.filter((user) =>
    user.fullName.toLowerCase().includes(search.trim().toLowerCase())
  );

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="flex h-full w-[4.5rem] shrink-0 flex-col border-r bg-background/80 transition-all sm:w-24 lg:w-80">
      <div className="flex items-center justify-center gap-3 border-b px-3 py-5 lg:justify-start lg:px-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Users className="size-5" />
        </span>
        <div className="hidden min-w-0 flex-1 lg:block">
          <h2 className="font-semibold tracking-tight">Messages</h2>
          <p className="text-xs text-muted-foreground">Your conversations</p>
        </div>
        <Badge variant="secondary" className="hidden lg:inline-flex">
          {onlineContacts.length} online
        </Badge>
      </div>

      <div className="hidden space-y-3 border-b p-4 lg:block">
        <Input
          aria-label="Search conversations"
          placeholder="Search people..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button
          type="button"
          variant={showOnlineOnly ? "secondary" : "ghost"}
          size="sm"
          className="w-full justify-start"
          onClick={() => setShowOnlineOnly((current) => !current)}
        >
          <span className="size-2 rounded-full bg-emerald-500" />
          {showOnlineOnly ? "Showing online" : "Show online only"}
        </Button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2 lg:p-3">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(String(user._id));
          const isSelected = String(selectedUser?._id) === String(user._id);

          return (
            <Button
              key={user._id}
              type="button"
              variant={isSelected ? "secondary" : "ghost"}
              className={`h-auto w-full justify-start gap-3 px-2 py-2.5 text-left lg:px-3 ${
                isSelected ? "ring-1 ring-primary/10" : ""
              }`}
              onClick={() => setSelectedUser(user)}
              title={user.fullName}
            >
              <span className="relative shrink-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt=""
                  className="size-10 rounded-full object-cover ring-1 ring-border"
                />
                <span
                  className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-background ${
                    isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                  }`}
                />
              </span>
              <span className="hidden min-w-0 flex-1 lg:block">
                <span className="block truncate text-sm font-medium">
                  {user.fullName}
                </span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {isOnline ? "Online now" : "Offline"}
                </span>
              </span>
            </Button>
          );
        })}
        {filteredUsers.length === 0 && (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground lg:px-4">
            {showOnlineOnly ? "No one is online right now." : "No conversations found."}
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;