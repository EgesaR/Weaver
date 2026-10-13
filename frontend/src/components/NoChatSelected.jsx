import { MessageSquare } from "lucide-react"
import { Badge } from "./ui/badge"

const NoChatSelected = () => {
    return (
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center bg-gradient-to-br from-background to-muted/30 p-8 text-center">
            <span className="mb-5 flex size-16 items-center justify-center rounded-2xl border bg-card text-primary shadow-sm">
                <MessageSquare className="size-7" />
            </span>
            <Badge variant="secondary" className="mb-4">Weaver messages</Badge>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Your conversations, together
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Choose someone from your conversations to start chatting. Your messages will appear here.
            </p>
        </div>
    )
}

export default NoChatSelected