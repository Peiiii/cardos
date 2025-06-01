// Message sent from a card (iframe) to the parent page
export interface CardToParentMessage<T = unknown> {
  type: 'cardEvent'; // Indicates the message is from a card
  sourceCardId: string;    // ID of the card sending the message
  eventType: string;       // Custom event type (e.g., 'dataUpdate', 'buttonClick')
  payload: T;            // Data associated with the event
}

// Message sent from the parent page to a card (iframe)
export interface ParentToCardMessage<T = unknown> {
  type: 'parentCommand'; // Indicates the message is from the parent
  commandType: string;     // Custom command type (e.g., 'updateDisplay', 'triggerAction')
  payload: T;            // Data associated with the command
  originCardId?: string; // Optional: ID of the card that originally triggered this command (if relayed)
}

// Type guard to check if a received message is a CardToParentMessage
export function isCardToParentMessage(obj: unknown): obj is CardToParentMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj && (obj as { type: string }).type === 'cardEvent' &&
    'sourceCardId' in obj && typeof (obj as { sourceCardId: string }).sourceCardId === 'string' &&
    'eventType' in obj && typeof (obj as { eventType: string }).eventType === 'string' &&
    'payload' in obj
  );
}

// Type guard to check if a received message is a ParentToCardMessage
export function isParentToCardMessage(obj: unknown): obj is ParentToCardMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj && (obj as { type: string }).type === 'parentCommand' &&
    'commandType' in obj && typeof (obj as { commandType: string }).commandType === 'string' &&
    'payload' in obj
  );
} 