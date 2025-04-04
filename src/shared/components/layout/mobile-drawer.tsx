import { ReactNode } from 'react';
import { Sheet, SheetContent } from '@/shared/components/ui/sheet';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function MobileDrawer({ 
  isOpen, 
  onClose, 
  children 
}: MobileDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[80%] sm:w-[350px]">
        {children}
      </SheetContent>
    </Sheet>
  );
} 