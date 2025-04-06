import { useCRUDResource } from './use-crud-resource';
import { conversationResource } from '../resources/conversation-resource';
import { conversationService } from '../services/conversation-service';
import { Conversation } from '../types/conversation';
import { useState, useCallback, useMemo } from 'react';
import { CRUDOperations } from './use-crud-resource';

export function useConversations() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const conversationCRUDAdapter: CRUDOperations<Conversation> = {
    list: () => conversationService.list(),
    read: (id: string) => conversationService.get(id),
    create: (data: Omit<Conversation, 'id'>) => conversationService.create(data),
    createMany: (items: Omit<Conversation, 'id'>[]) => 
      conversationService.createMany(items.map(item => item.title)),
    update: (id: string, data: Partial<Conversation>) => conversationService.update(id, data),
    delete: (id: string) => conversationService.delete(id)
  };

  const {
    data: conversations,
    isLoading: loading,
    error,
    create: createConversation,
    update: updateConversation,
    remove: deleteConversation,
    reload: loadConversations
  } = useCRUDResource<Conversation>(conversationResource, conversationCRUDAdapter, {
    onError: (error) => {
      console.error('Conversation operation failed:', error);
    },
    onSuccess: (data) => {
      console.log('Conversation operation succeeded:', data);
    }
  });

  const selectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  const selectedConversation = useMemo(() => {
    return conversations?.find(conv => conv.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  return {
    conversations: conversations || [],
    selectedConversation,
    loading,
    error,
    loadConversations,
    createConversation,
    updateConversation,
    deleteConversation,
    selectConversation
  };
} 