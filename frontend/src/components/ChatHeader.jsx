import { useChatStore } from "../store/useChatStore"
import { useAuthStore } from "../store/useAuthStore"
import { X } from "lucide-react"

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore()
    const { onlineUsers } = useAuthStore()

    return (
        <div className="p-2.5 border-b border-neutral-300"> 
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="avatar">
                        <div className="inline-block size-8 rounded-full ring-2 ring-white outline -outline-offset-1 outline-black/5" >
                            <img src={selectedUser.profilePic || "avatar.png"} alt={selectedUser.fullName} className="inline-block size-8 rounded-full ring-2 ring-white outline -outline-offset-1 outline-black/5" />
                        </div>
                    </div>

                    {/* User Info */}
                    <div>
                        <h3 className="font-medium">
                            {selectedUser.fullName}
                        </h3>
                        <p className="text-sm text-orange-400/70">
                            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>

                {/* Close Button */}
                <button onClick={() => setSelectedUser(null)}>
                    <X />
                </button>
            </div>
        </div>
    )
}

export default ChatHeader