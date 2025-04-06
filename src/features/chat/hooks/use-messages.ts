import { useCRUDResource } from './use-crud-resource';
import { messageResource } from '../resources/message-resource';
import { messageService } from '../services/message-service';
import { Message } from '../types/message';
import { chatStore } from '@/store/chat-store';
import { CRUDOperations } from './use-crud-resource';

export function useMessages() {
  const conversationId = chatStore.getState().currentConversationId;

  const messageCRUDAdapter: CRUDOperations<Message> = {
    list: () => messageService.list(conversationId || ''),
    read: (id: string) => messageService.get(id),
    create: (data: Omit<Message, 'id'>) => messageService.create(data),
    createMany: (items: Omit<Message, 'id'>[]) => 
      messageService.createMany(items.map(item => item.content), conversationId || ''),
    update: (id: string, data: Partial<Message>) => messageService.update(id, data),
    delete: (id: string) => messageService.delete(id)
  };

  return useCRUDResource<Message>(messageResource, messageCRUDAdapter, {
    onError: (error) => {
      console.error('Message operation failed:', error);
    },
    onSuccess: (data) => {
      console.log('Message operation succeeded:', data);
    }
  });
}
