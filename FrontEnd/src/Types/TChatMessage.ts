export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface BaseUser {
  _id: string;
  email?: string;
  isAdmin?: boolean;
  isModerator?: boolean;
}

export interface ChatUser extends BaseUser {
  username: string;
  profileImage?: {
    url: string;
    alt: string;
  };
}

export interface ChatMessage {
  _id: string;
  content: string;
  userId: ChatUser;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrivateMessage extends ChatMessage {
  recipientId: string | User;
  isPrivate: true;
}

export interface User {
  _id: string;
  username: string;
  profileImage?: {
    url: string;
    alt?: string;
  };
}

export interface SocketJoinRoomResponse {
  success: boolean;
  error?: string;
}

export interface GroupChatContextType {
  hobbies: string[];
  allHobbies: string[];
  loading: boolean;
  error: string | null;
  currentChat: string | null;
  messages: ChatMessage[];
  currentUser: ChatUser | null;
  members: { [key: string]: Member[] };
  openChat: (hobby: string) => void;
  closeChat: () => void;
  leaveChat: (hobby: string) => void;
  sendMessage: (content: string) => void;
  fetchAllHobbies: () => Promise<void>;
  fetchMembers: (hobby: string) => Promise<void>;
}


export interface Member {
  _id: string;
  username: string;
  profileImage?: { url: string; alt: string };
  hobbies: string[];
  isAdmin?: boolean;
  isModerator?: boolean;
  name?: { first: string; last: string };
}


export interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onClose: () => void;
  roomName: string;
}
