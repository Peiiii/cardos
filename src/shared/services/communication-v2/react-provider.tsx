import { useState } from "react";
import { CommunicationManager } from "./core";
import { CommunicationContext } from "./use-existing-communication-manager";

export function CommunicationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [communicationManager] = useState(() => new CommunicationManager());

  return (
    <CommunicationContext.Provider value={communicationManager}>
      {children}
    </CommunicationContext.Provider>
  );
}
