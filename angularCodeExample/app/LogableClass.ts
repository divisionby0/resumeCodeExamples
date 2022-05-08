import {EventBus} from "./lib/events/EventBus";
import {AppEvent} from "./AppEvent";
export class LogableClass{
    constructor(){
    }

    protected log(value:any, ...rest):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    protected getClassName():string{
        return "";
    }
}