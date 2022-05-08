import {BackendResponse} from "../BackendResponse";
import {EventBus} from "../../lib/events/EventBus";
import {AppEvent} from "../../AppEvent";
export class BackendResponseParser {
    protected userId:string;
    protected data:any;

    constructor(userId:string, data:any) {
        this.userId = userId;
        this.data = data;
    }
    
    public parse():BackendResponse{
        if(this.data && this.data.body){
            return new BackendResponse("...", // rest data);
        }
        else{
            return new BackendResponse("error",null, "payload not exists");
        }
    }

    protected log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    protected getClassName():string{
        return "BackendResponseParser";
    }
}