import { createContext, useContext } from "react";
import { CommunicationManager } from "./core";

export const CommunicationContext = createContext<CommunicationManager | null>(null);


export const useExistingCommunicationManager = () => {
    const communicationManager = useContext(CommunicationContext);
    if (!communicationManager) {
      throw new Error("CommunicationManager not found");
    }
    return communicationManager;
  };
  