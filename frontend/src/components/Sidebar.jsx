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
  const[showOnlineOnly,
    setShowOnlineOnly] = useState(false)

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly ? users.filter(user => onlineUsers.includes(user._id)): users

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 flex flex-col border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-4 lg:p-5 flex items-center gap-2">
        <Users className="size-5" />
        <span className="font-medium hidden lg:block">Contacts</span>
      </div>

      <div className="mt-3 hidden lg:flex items-center gap-2">
        <label className="cursor-pointer flex items-center gap-2">
          <input
          type="checkbox"
          checked={showOnlineOnly}
          onChange={e => setShowOnlineOnly(e.target.checked)}
          className="checkbox checkbox-sk"
          />
        <span className="text-sm">Show online only</span>
      </label>
      <span className="text-xs text-zinc-500">
        ({onlineUsers.length - 1} online)
      </span>
    </div>

    <div className="overflow-y-auto flex-1 w-full py-3">
      {filteredUsers.map((user) => (
        <button
          key={user._id}
          onClick={() => setSelectedUser(user)}
          className={`
          w-full p-3 flex items-center gap-3 text-left
          hover:bg-base-300 transition-colors duration-200
          ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300": ""}
          `}
          >
          <div className="relative flex-shrink-0">
            <img
            src={user.profilePic || "/avatar.png"}
            alt={user.name}
            className="w-12 h-12 object-cover rounded-full"
            />
          {onlineUsers.includes(user._id) && (
            <span className="absolute bottom-0 right-0 size-3 bg-green-400 border-2 border-zinc-900 rounded-full" />
          )}
        </div>

        {/* User info (only visible on large screens) */}
        <div className="hidden lg:flex flex-col truncate min-w-0">
          <div className="font-medium truncate">
            {user.fullName}
          </div>
          <div className="text-sm text-zinc-400">
            {onlineUsers.includes(user._id) ? "Online": "Offline"}
          </div>
        </div>
      </button>
      ))}
    {filteredUsers.length === 0 && (
      <div className="text-center text-zinc-500 py-4">
        users
        No online
      </div>
    )}
  </div>
</aside>
);
};

export default Sidebar;