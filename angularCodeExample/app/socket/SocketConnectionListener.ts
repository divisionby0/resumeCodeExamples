import {Subject} from "rxjs/index";
import {EventBus} from "../lib/events/EventBus";
import {SocketEvent} from "./SocketEvent";
import {SocketClientEventNames} from "./SocketClientEventNames";
import {CurrentMediaState} from "../media/CurrentMediaState";
import {AppEvent} from "../AppEvent";

export class SocketConnectionListener{
    private socket:any;
    private connectedSubject:Subject<void> = new Subject();
    private connectionFailedSubject:Subject<void> = new Subject();
    private eventNamesReceivedSubject:Subject<void> = new Subject<void>();
    private currentTransport:string = "poll";

    constructor(socket:any) {
        this.socket = socket;
        this.constructorPreActions();
        EventBus.dispatchEvent(SocketEvent.TRANSPORT_CHANGED, this.currentTransport);
    }

    public getConnectedSubject():Subject<void>{
        return this.connectedSubject;
    }
    public getConnectionFailedSubject():Subject<void>{
        return this.connectionFailedSubject;
    }
    public getEventNamesReceivedSubject():Subject<void>{
        return this.eventNamesReceivedSubject;
    }
    public getCurrentTransport():string{
        return this.currentTransport;
    }

    public disconnectSocket():void{
        if(this.socket){
            try{
                this.destroyAfterActions();
                this.socket.disconnect();
                this.log("socket disconnected");
            }
            catch(error){
                console.error(error);
            }
        }
    }

    public disconnect(): void {
        if(this.socket){
            try{
                this.socket.emit("disconnect");
                this.destroyAfterActions();
                this.socket.disconnect();
                this.log("socket disconnected");
            }
            catch(error){
                console.error(error);
            }
        }
    }
    public emitDisconnect(): void {
        this.socket.emit("disconnect");
    }

    private onSocketConnected():void{
        console.log(" !!! onSocketConnected");
        EventBus.dispatchEvent(SocketEvent.ON_SOCKET_CONNECTED, this.socket);
    }
    private onIOReconnectAttempt():void{
        this.log("IO reconnect attempt. Current transport "+this.currentTransport);
        this.onReconnectAttempt();
    }
    private onReconnectAttempt():void{
        this.log("reconnect attempt... ");

        this.downFallTransport();

        var mediaStates:any = JSON.stringify({
            audioPublishState:CurrentMediaState.getInstance().getAudioPublishState(),
            videoPublishState:CurrentMediaState.getInstance().getVideoPublishState(),
            subscribeState:CurrentMediaState.getInstance().getSubscribeState()
        });

        this.socket.io.opts.query.mediaStates = mediaStates;
        
        EventBus.dispatchEvent(SocketEvent.ON_RECONNECT_ATTEMPT, null);
    }

    private onIOReconnected():void{
        this.log("IO reconnected !");
        this.onReconnected();
    }
    private onReconnected():void{
        this.log("socket reconnected socket id="+ this.socket.id);
        EventBus.dispatchEvent(SocketEvent.ON_RECONNECTED, null);
        EventBus.dispatchEvent(SocketEvent.RECONNECTED, null);
    }
    private onReconnectFailed():void{
        EventBus.dispatchEvent(SocketEvent.ON_RECONNECT_FAILED, null);
        this.connectionFailedSubject.next();
    }
    private onIOReconnectFailed():void{
        this.log("IO reconnect failed");
        this.onReconnectFailed();
    }
    private onConnectFailed():void{
        this.log("connect_failed");
    }
    private onDisconnect():void{
        EventBus.dispatchEvent(SocketEvent.ON_DISCONNECT, null);
    }
    private onPermanentDisconnect(data:any):void{
        this.emitDisconnect();
        EventBus.dispatchEvent(SocketEvent.ON_PERMANENT_DISCONNECT, data);
    }

    private onSocketClientEventNames(data:any):void{
        this.log("socket client event names received and parsed");
        SocketClientEventNames.getInstance().setNames(data);
        this.removeClientListeners();

        this.socket.on(SocketClientEventNames.getInstance().getName(SocketClientEventNames.CONNECTION_CREATED), (serverVersion:string) => {
            this.connectedSubject.next();
            EventBus.dispatchEvent(SocketEvent.CONNECTION_CREATED, serverVersion);
        });

        this.eventNamesReceivedSubject.next();
        //this.createClientListeners();
    }
    
    private removeClientListeners():void{
        this.socket.removeAllListeners();
    }

    private downFallTransport():void{
        this.log("making downfall transport to polling");
        this.socket.io.opts.transports = ['polling'];
        this.currentTransport = "poll";
        EventBus.dispatchEvent(SocketEvent.TRANSPORT_CHANGED, this.currentTransport);
    }

    private constructorPreActions(): void {
        var that = this;

        this.socket.on('connect', ()=>{
            that.onSocketConnected()
        });

        this.socket.io.on('reconnect_attempt', () => this.onIOReconnectAttempt());
        this.socket.on('reconnect_attempt', () => this.onReconnectAttempt());

        this.socket.on('reconnect', () => this.onReconnected());
        this.socket.io.on('reconnect', () => this.onIOReconnected());

        this.socket.on('reconnect_failed', () => this.onReconnectFailed());
        this.socket.io.on('reconnect_failed', () => this.onIOReconnectFailed());

        this.socket.on('connect_failed', () => this.onConnectFailed());
        this.socket.on('disconnect', () => this.onDisconnect());
        this.socket.on('permanentDisconnect', (data:any) => this.onPermanentDisconnect(data));

        this.socket.on('onSocketClientEventNameCollection', (data:any) => {
            that.onSocketClientEventNames(data)
        });
    }

    private destroyAfterActions():void{
    }

    private log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:"["+this.currentTransport+"] "+value, rest:rest});
    }

    private getClassName():string{
        return "SocketConnectionListener";
    }
}