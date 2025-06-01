export class LinkUtilService {
  pathOfCards=()=>{
    return "/my-cards";
  }

  pathOfCard=(cardId:string)=>{
    return `/card/${cardId}`;
  }

  pathOfCreateCard=()=>{
    return "/create";
  }

  pathOfChat=(chatId:string)=>{
    return `/chat/${chatId}`;
  }
  
  pathToHref=(path:string)=>{
    return `/#${path}`;
  }
  
}

export const linkUtilService = new LinkUtilService();