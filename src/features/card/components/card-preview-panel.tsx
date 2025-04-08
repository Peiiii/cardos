import { Card } from '../types/card';

interface CardPreviewPanelProps {
  card: Card;
}

export function CardPreviewPanel({ card }: CardPreviewPanelProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
      <div className="prose dark:prose-invert">
        {card.content}
      </div>
    </div>
  );
} 