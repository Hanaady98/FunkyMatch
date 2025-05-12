export default function UserMessageBubble({
    content,
    profileImage,
    timestamp
}: {
    content: string;
    profileImage?: string;
    timestamp: Date;
}) {
    return (
        <div className="flex justify-end gap-2 mb-4">
            <div className="flex flex-col items-end max-w-[80%]">
                <span className="text-sm font-medium text-gray-800">You</span>
                <div className="p-3 mt-1 text-white bg-blue-500 rounded-lg rounded-br-none">
                    {content}
                </div>
                <span className="mt-1 text-xs text-gray-500">
                    {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {/* Your profile picture (right side) */}
            <img
                src={profileImage || '/default-profile.png'}
                alt="Your profile"
                className="object-cover w-8 h-8 rounded-full"
            />
        </div>
    );
}