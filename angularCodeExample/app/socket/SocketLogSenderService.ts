import {EventBus} from "../lib/events/EventBus";
import {Settings} from "../Settings";
import {Injectable} from "@angular/core";
import {IBackend} from "../backend/IBackend";
import {HttpResponse} from "@angular/common/http";
@Injectable({
    providedIn:'root'
})
export class SocketLogSenderService {
    private socket:any;
    private backend:IBackend;
    private userId:string;

    constructor() {
        EventBus.addEventListener("LOG_EVENT", (data)=>this.onLog(data));
    }

    public setUserId(userId:string):void{
        this.userId = userId;
    }
    public setSocket(socket:any):void{
        this.socket = socket;
    }
    public setBackend(backend:IBackend):void{
        this.backend = backend;
    }
    
    private onLog(data:any):void {
        const dataToSend:any = {appVer:Settings.getInstance().getVersion(),userId:Settings.getInstance().getCurrentUserId(), userType:Settings.getInstance().getCurrentUserType(), data:data};
        let jsonData:string;

        try{
            jsonData = JSON.stringify(dataToSend);
        }
        catch(error){
            console.error("Convert to JSON error:"+error);
            console.error("dataToSend = ",dataToSend);
            return;
        }

        if(jsonData){
            if(this.socket && this.socket.connected) {
                this.socket.emit("clientLog", jsonData);
            }
            else{
                // try to send to http route
                if(this.backend){
                    this.backend.sendClientLogToSocketServerRoute(jsonData).subscribe((response:HttpResponse<string>)=>{
                        //console.log("send log to socket http route response: ",response);
                    },(error)=>{
                        console.log("send client log to socket server route error:",error);
                    });
                }
                else{
                    console.error("Send log to socket error. Socket not set or not connected. Or backend not set");
                }
            }
        }
    }
}