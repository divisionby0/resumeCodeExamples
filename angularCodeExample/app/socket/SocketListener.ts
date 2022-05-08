import {SocketEvent} from "./SocketEvent";
import {SocketClientEventNames} from "./SocketClientEventNames";
import {EventBus} from "../lib/events/EventBus";
import {AppEvent} from "../AppEvent";
export class SocketListener{

    private socket:any;
    private currentTransport:string = "poll";

    constructor(socket:any) {
        this.socket = socket;
        EventBus.addEventListener(SocketEvent.TRANSPORT_CHANGED, (transport)=>this.onTransportChanged(transport));
    }
    
    public createClientListeners():void{
        var that = this;
        this.socket.on("unreadMessages", (data:any) => {
            EventBus.dispatchEvent(SocketEvent.ON_UNREAD_MESSAGES, data);
        });
        
        this.socket.on("startChat", (data:any) => {
            //console.log("socket message arrived: startChat data=",data);
            const userId = data.userId;
            
            EventBus.dispatchEvent(SocketEvent.ON_START_TEXT_CHAT, userId);
        });

        this.socket.on("startChatFromInvite", (data:any) => {
            const corrId = data.corrId;

            EventBus.dispatchEvent(SocketEvent.ON_START_CHAT_FROM_INVITE, {
                corrId: corrId
            });
        });

        this.socket.on("messageSendError", (data:any)=>{
            EventBus.dispatchEvent(SocketEvent.ON_SEND_MESSAGE_ERROR, data);
        });
        this.socket.on("receivePrivateMessage", (data:any) => {
            EventBus.dispatchEvent(SocketEvent.ON_PRIVATE_MESSAGE_RECEIVED, data);
        });
        
        this.socket.on(SocketClientEventNames.getInstance().getName(SocketClientEventNames.TEXT_CHAT_EMERGENCY_STOPPED), (data:any) => {
            EventBus.dispatchEvent(SocketEvent.ON_TEXT_CHAT_EMERGENCY_STOPPED, data);
        });
        
        this.socket.on("textChatParticipantNotOnline", (participantId:string)=>{
            // todo implement later
        });

        this.socket.on("unreadMessagesCount", (data:any) => {
            EventBus.dispatchEvent(SocketEvent.ON_UNREAD_MESSAGES_COUNT, data);
        });
        this.socket.on("unreadMessagesCollection", (data:any) => {
            EventBus.dispatchEvent(SocketEvent.ON_UNREAD_MESSAGES_COLLECTION, data);
        });

        this.socket.on("stopConversation", (data:any) => {
            const reason = data.reason;
            EventBus.dispatchEvent(SocketEvent.ON_STOP_CHAT, {
                reason: reason
            });
        });
        this.socket.on("blockPrivateMessage", (data:any) => {
            const fromUserId = data.fromUserId;
            EventBus.dispatchEvent(SocketEvent.ON_BLOCK_PRIVATE_MESSAGE, {
                fromUserId: fromUserId
            });
        });
        this.socket.on("closePrivateMessage", (data:any) => {
            const fromUserId = data.fromUserId;

            EventBus.dispatchEvent(SocketEvent.ON_CLOSE_PRIVATE_MESSAGE, {
                fromUserId: fromUserId
            });
        });
        
        // ...REST LISTENERS
    }

    private onTransportChanged(transport:string):void{
        this.currentTransport = transport;
    }
    
    private log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:"["+this.currentTransport+"] "+value, rest:rest});
    }

    protected getClassName():string{
        return "SocketListener";
    }
}