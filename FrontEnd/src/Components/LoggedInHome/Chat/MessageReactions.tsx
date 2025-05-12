"use client";

import { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { Reaction } from "../../../Types/TChatMessage.ts";

interface MessageReactionsProps {
    messageId: string;
    reactions?: Reaction[];
    currentUserId: string;
    onReact: (messageId: string, emoji: string) => void;
}

export default function MessageReactions({
    messageId,
    reactions,
    currentUserId,
    onReact,
}: MessageReactionsProps) {
    const [showPicker, setShowPicker] = useState(false);

    const handleReaction = (emojiData: { emoji: string }) => {
        onReact(messageId, emojiData.emoji);
        setShowPicker(false);
    };

    return (
        <div className="flex items-center gap-1 mt-1">
            {reactions?.map((reaction, index) => (
                <button
                    key={index}
                    onClick={() => onReact(messageId, reaction.emoji)}
                    className={`text-xs p-1 rounded-full ${reaction.userIds.includes(currentUserId) ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                    {reaction.emoji} {reaction.userIds.length}
                </button>
            ))}
            <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-1 text-xs text-gray-400 hover:text-blue-500"
            >
                +
            </button>
            {showPicker && (
                <div className="absolute bottom-8">
                    <EmojiPicker
                        width={300}
                        height={350}
                        onEmojiClick={handleReaction}
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            )}
        </div>
    );
}