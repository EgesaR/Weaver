import { MessageSquare } from "lucide-react"

const NoChatSelected = () => {
    return (
        <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
            <div className="max-w-md text-center space-y-6">
                {/* Icon Display */}
                <div className="flex justify-center gap-4 mb-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-orange-300/30 flex items-center justify-center animate-bounce">
                            <MessageSquare className="w-8 h-8 text-orange-300" />
                        </div>
                    </div>
                </div>

                {/* Welcome Text */}
                <h2 className="text-2xl font-bold">
                    Welcome to Weaver!
                </h2>
                <label className="text-base-content/60">
                    Select a conversationfrom the sidebar to start chatting
                </label>
            </div>
        </div>
    )
}

export default NoChatSelected