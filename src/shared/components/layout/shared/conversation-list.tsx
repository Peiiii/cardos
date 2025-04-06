import { useNavigate } from "react-router-dom";
import { ConversationItem } from "@/features/chat/components/conversation-item";
import { useConversations } from '@/features/chat/hooks/use-conversations';

export function ConversationList() {
  const navigate = useNavigate();
  const {
    conversations,
    selectedConversation,
    selectConversation
  } = useConversations();

  // 切换对话
  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);
    navigate(`/chat/${conversationId}`);
  };

  return (
    <div className="flex-1 overflow-auto">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          title={conversation.title}
          timestamp={conversation.timestamp}
          isActive={conversation.id === selectedConversation?.id}
          onClick={() => handleSelectConversation(conversation.id)}
        />
      ))}
    </div>
  );
} 