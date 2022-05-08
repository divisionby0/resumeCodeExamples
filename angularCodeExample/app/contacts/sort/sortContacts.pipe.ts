import {Pipe, PipeTransform} from "@angular/core";
import {EventBus} from "../../lib/events/EventBus";
import {AppEvent} from "../../AppEvent";
import {Contact} from "../contact/Contact";
import {MediaState} from "../contact/states/MediaState";

@Pipe({
  name: "sortContacts"
})
export class SortContactsPipe implements PipeTransform {

  /* Sort priority:
    * 1. Selected
    * 2. Has active media
   *  3. Number of unread messages
   *  4. Online state
   *  5. Contact name
   *  6. Contact id */
  public transform(array: Array<Contact>): Array<Contact> {

    array.sort(function (a:Contact, b:Contact) {
      if(b.isSelected() && !a.isSelected()){
        return 1;
      }
      else if(!b.isSelected() && a.isSelected()){
        return -1;
      }
      else{
        const aHasOutMedia: boolean =  a.getOutgoingAudioState().getState() == MediaState.NORMAL || a.getOutgoingVideoState().getState() == MediaState.USED || a.getOutgoingVideoState().getState() == MediaState.NORMAL;
        const bHasOutMedia: boolean =  b.getOutgoingAudioState().getState() == MediaState.NORMAL || b.getOutgoingVideoState().getState() == MediaState.NORMAL;

        if(bHasOutMedia && !aHasOutMedia){
          return 1;
        }
        else if(!bHasOutMedia && aHasOutMedia){
          return -1;
        }
        else{
          if(a.getUnreadMessagesTotal() && b.getUnreadMessagesTotal()){
            return b.getUnreadMessagesTotal() - a.getUnreadMessagesTotal();
          }
          else if(b.getUnreadMessagesTotal() && !a.getUnreadMessagesTotal()){
            return 1;
          }
          else if(a.getUnreadMessagesTotal() && !b.getUnreadMessagesTotal()){
            return -1;
          }
          else{
            if(b.getIsOnline() && !a.getIsOnline()){
              return 1;
            }
            else if(a.getIsOnline() && !b.getIsOnline()){
              return -1;
            }
            else{
              if(a.getName() > b.getName()){
                return 1;
              }
              else if(b.getName() > a.getName()){
                return -1;
              }
              else{
                if(parseInt(a.getId()) > parseInt(b.getId())){
                  return 1;
                }
                else if(parseInt(b.getId()) > parseInt(a.getId())){
                  return -1;
                }
                else{
                  return 0;
                }
              }
            }
          }
        }
      }
    });

    return array;
  }

  private log(value:any, ...rest:any[]):void{
    EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
  }

  private getClassName():string{
    return "SortContactsPipe";
  }
}
