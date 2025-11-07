const MessageSkeleton = () => {
    // Create an array of 6 items for messages
    const skeletonMessages = Array(6).fill(null);
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {skeletonMessages.map((_, idx) => (
                <div key={idx} className={`${idx % 2 === 0 ? "chat-start" : "chat-end"} flex items-start`}>
                    <div className="chat-image avatar">
                        <div className="inline-block size-8 rounded-full ring-2 ring-white outline -outline-offset-1 outline-black/5">
                            {/* Skeleton for Avatar */}
                            <div className="w-full h-full bg-gray-200 animate-pulse rounded-full" />
                        </div>
                    </div>

                    {/* Skeleton for Chat Header */}
                    <div className="mb-1 flex flex-col space-y-1">
                        <div className="bg-gray-200 animate-pulse h-4 w-16 rounded" />
                    </div>

                    {/* Skeleton for Chat Bubble */}
                    <div className="flex flex-col space-y-2">
                        <div className="bg-gray-200 animate-pulse h-16 w-[200px] rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageSkeleton;
