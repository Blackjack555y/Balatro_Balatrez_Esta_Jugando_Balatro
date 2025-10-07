// Chat types and mock implementations for chat list

export type Peer = {
  user_id: number;
  nickname?: string;
  avatar_url?: string;
};

export type Message = {
  content: string;
  created_at: string;
};

export type Conversation = {
  peer: Peer;
  lastMessage: Message;
};

// Converts user id to number (handles string/number)
export function toNumberId(id: string | number): number | null {
  const num = typeof id === "string" ? parseInt(id, 10) : id;
  return isNaN(num) ? null : num;
}

// Mock: fetches conversations for a user
export async function listConversations(userId: number): Promise<Conversation[]> {
  // Replace with Supabase query in production
  return [
    {
      peer: {
        user_id: 2,
        nickname: "Alice",
        avatar_url: undefined,
      },
      lastMessage: {
        content: "Hey, how are you?",
        created_at: new Date().toISOString(),
      },
    },
    {
      peer: {
        user_id: 3,
        nickname: "Bob",
        avatar_url: undefined,
      },
      lastMessage: {
        content: "Let's play Balatro!",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    },
  ];
}