import { useChatStore } from "../store/useChatStore"
import { useAuthStore } from "../store/useAuthStore"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore()
    const { onlineUsers } = useAuthStore()
    const isOnline = onlineUsers.includes(String(selectedUser?._id))

    return (
        <header className="flex items-center justify-between border-b bg-background/90 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 lg:hidden"
                    aria-label="Close conversation"
                    onClick={() => setSelectedUser(null)}
                >
                    <ArrowLeft />
                </Button>
                <div className="relative shrink-0">
                    <img
                        src={selectedUser?.profilePic || "/avatar.png"}
                        alt=""
                        className="size-11 rounded-full object-cover ring-1 ring-border"
                    />
                    <span
                        className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-background ${
                            isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                        }`}
                    />
                </div>
                <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold sm:text-base">
                        {selectedUser?.fullName}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge
                            variant={isOnline ? "secondary" : "outline"}
                            className="h-5 px-2 font-medium"
                        >
                            {isOnline ? "Online" : "Offline"}
                        </Badge>
                        <span>Direct message</span>
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="hidden lg:inline-flex"
                    aria-label="Close conversation"
                    onClick={() => setSelectedUser(null)}
                >
                    <X />
                </Button>
            </div>
        </header>
    )
}

export default ChatHeader