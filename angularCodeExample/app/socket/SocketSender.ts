import {BackendService} from "../backend/backend.service";
import {SocketClientEventNames} from "./SocketClientEventNames";
import {Observable, of} from "rxjs/index";
import {Settings} from "../Settings";
import {EventBus} from "../lib/events/EventBus";
import {DebugEvent} from "../DebugEvent";
import {SocketError} from "./SocketError";
import {Contact} from "../contacts/contact/Contact";
import {StopMediaSubscriptionResult} from "../streaming/client/StopMediaSubscriptionResult";
import {SocketEvent} from "./SocketEvent";
import {AppEvent} from "../AppEvent";
export class SocketSender{

    private socket:any;
    private currentTransport:string = "poll";
    private backendService:BackendService;

    constructor(socket:any) {
        this.socket = socket;
        EventBus.addEventListener(SocketEvent.TRANSPORT_CHANGED, (transport)=>this.onTransportChanged(transport));
    }

    public setBackendService(value:BackendService):void{
        this.backendService = value;
    }
    
    public getLadyVideoStateCollection():void {
        this.socket.emit("...");
    }

    public sendPublishAudioState(data:any):void {
        this.socket.emit(SocketClientEventNames.getInstance().getName(SocketClientEventNames.AUDIO_PUBLISH_STATE), data);
    }
    public sendPublishVideoState(data:any):void {
        this.socket.emit(SocketClientEventNames.getInstance().getName(SocketClientEventNames.VIDEO_PUBLISH_STATE), data);
    }

    public sendSubscribeState(data:any):void{
        this.socket.emit(SocketClientEventNames.getInstance().getName(SocketClientEventNames.SUBSCRIBE_STATE), data);
    }

    public sendUserName(name:string):void{
        this.socket.emit("userName", name);
    }

    public sendAllStates(data:any):void{
        if(Settings.getInstance().isDebugging()){
            EventBus.dispatchEvent(DebugEvent.ALL_STATED_DATA, data);
        }
        this.socket.emit(SocketClientEventNames.getInstance().getName(SocketClientEventNames.ALL_STATES), data);
    }

    public sendPrivateMessage(message: any, senderId:string): Promise<any> {
        if (this.socket.connected == false) {
            this.log("Error send private message. Socket not connected. SenderId:" + senderId+" receiverId " + message.toUserId);

            return new Promise<any>((resolve, reject) => {
                reject(SocketError.SOCKET_NOT_CONNECTED);
            });
        }
        
        this.socket.emit("...", {
            toUserId: message.toUserId,
            msg: message.msg.wrappedMsg ? JSON.stringify({type: "text", content: message.msg.wrappedMsg}) : JSON.stringify(message.msg),
            wrappedMsg: message.msg.wrappedMsg
        });

        return new Promise<any>((resolve, reject) => {
            this.socket.on("..", (data:any) => {
                this.socket.removeAllListeners("...");
                if (data.success) {
                    resolve("OK");
                } else {
                    reject("FAIL");
                }
            });
        });
    }

    public subscribeAudio(broadcasterId: string): Promise<{ password: string, uri: string }> {
        var eventName:string = SocketClientEventNames.getInstance().getName(SocketClientEventNames.SUBSCRIBE_AUDIO);

        this.socket.emit(eventName, {
            broadcasterId: broadcasterId,
            socketId:this.socket.id
        });

        return new Promise<{ password: string, uri: string }>((resolve, reject) => {
            this.socket.on("...", (data:any) => {
                this.socket.removeAllListeners("...");
                if (data.success) {
                    resolve({
                        password: data.password,
                        uri: data.uri
                    });
                } else {
                    reject();
                }
            });
        });
    }

    // ... rest senders

    private onTransportChanged(transport:string):void{
        this.currentTransport = transport;
    }

    private log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:"["+this.currentTransport+"] "+value, rest:rest});
    }


    protected getClassName():string{
        return "SocketSender";
    }
}