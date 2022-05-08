import {Injectable} from "@angular/core";
import {EventBus} from "../../lib/events/EventBus";
import {SocketEvent} from "../../socket/SocketEvent";
import {AppEvent} from "../../AppEvent";
import {Subject} from "rxjs/index";
@Injectable({
    providedIn:"root"
})
export class MediaLibrarySocketService {

    private socket:any;

    private userMediaAddedSubject:Subject<any> = new Subject<any>();
    private userMediaRemovedSubject:Subject<number> = new Subject<number>();

    constructor() {
        EventBus.addEventListener(SocketEvent.ON_SOCKET_CONNECTED, (socket)=>this.onSocketConnected(socket));
    }

    public getUserMediaAddedSubject():Subject<any>{
        return this.userMediaAddedSubject;
    }
    public getUserMediaRemovedSubject():Subject<number>{
        return this.userMediaRemovedSubject;
    }
    
    private onSocketConnected(socket:any):void{
        this.log("socket connected socket="+socket);
        this.socket = socket;
        this.socket.on("userMediaAdded", (media)=>this.onUserMediaAdded(media));
        this.socket.on("userMediaRemoved", (mediaId)=>this.onUserMediaRemoved(mediaId));
    }
    
    private onUserMediaAdded(media:any):void{
        this.log("user media added: ", media);
        this.userMediaAddedSubject.next(media);
    }
    private onUserMediaRemoved(mediaId:number):void{
        this.log("user media removed: ", mediaId);
        this.userMediaRemovedSubject.next(mediaId);
    }

    private log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    private getClassName():string{
        return "MediaLibrarySocketService";
    }
}