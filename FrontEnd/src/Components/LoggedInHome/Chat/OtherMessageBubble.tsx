export default function OtherMessageBubble({
    content,
    username,
    profileImage,
    timestamp
}: {
    content: string;
    username: string;
    profileImage?: string;
    timestamp: Date;
}) {
    return (
        <div className="flex justify-start gap-2 mb-4">

            <img
                src={profileImage || '/default-profile.png'}
                alt={`${username}'s profile`}
                className="object-cover w-8 h-8 rounded-full"
            />

            <div className="flex flex-col max-w-[80%]">
                <span className="text-sm font-medium text-gray-800">
                    {username || 'User'}
                </span>
                <div className="p-3 mt-1 text-gray-800 bg-gray-200 rounded-lg rounded-bl-none">
                    {content}
                </div>
                <span className="mt-1 text-xs text-gray-500">
                    {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}