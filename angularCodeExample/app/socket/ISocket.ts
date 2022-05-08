import {Observable, Subject} from "rxjs/index";
import {StartMediaSubscriptionResult} from "../streaming/client/StartMediaSubscriptionResult";
import {StopMediaSubscriptionResult} from "../streaming/client/StopMediaSubscriptionResult";
import {HttpResponse} from "@angular/common/http";
import {IConnectionFailedSubjectProvider} from "./IConnectionFailedSubjectProvider";
import {ISelfOSAndBrowserInfo} from "../ISelfOSAndBrowserInfo";
import {SocketLogSenderService} from "./SocketLogSenderService";
import {StartMediaPublishingResult} from "../streaming/client/StartMediaPublishingResult";
export interface ISocket extends IConnectionFailedSubjectProvider{
    setSocketLogSender(socketLogSender:SocketLogSenderService):void;
    setSelfOSAndBrowserInfo(provider:ISelfOSAndBrowserInfo);
    setSelfId(id:string):void;
    setSessionId(sessionId:string):void;
    setUserName(userName:string):void;
    connect():void;
    disconnect(): void;
    isConnected():boolean;

    // contact
    getSocketId():string;
    sendUserName(userName:string):void;

    sendPublishAudioState(data:any):void;
    sendPublishVideoState(data:any):void;
    sendSubscribeState(data:any):void;
    sendAllStates(data:any):void;
    sendPublishVideoPossiblyFrozen():void;
    sendPublishVideoFrozen():void;

    endChat(toUserId: string, fromUserId: string): void;

    sendRemoveContact(userId:string):void; // TODO remove send verb
    sendUnbanContact(userId:string):Observable<any>; // TODO remove send verb

    sendPrivateMessage(message: any, senderId: string): Promise<any>;
    
    // http route
    // TODO вызовы http перенесены в backend, это нелогично. ВСе же, мы обращается к сокету а не к backend. Впоследствии перенести их сюда
    onCloseInvitation(senderId:string):Observable<HttpResponse<string>>;
    onBlockInvitations(senderId:string):Observable<HttpResponse<string>>;
    
    deletePrivateMessage(message: { toUserId: number, time: Date }): void;
    onReceiveMessageNotification(): Observable<{ fromUserId: string, msg: string, time: Date }>;
    getUnreadMessagesCount(): void;
    getUnreadMessages(senderId:string): void;
    sendTypingNotification(toUserId: string): void;

    canStartPublishAudio(): Observable<boolean>;
    startPublishAudio(data:any): Observable<any>;
    unpublishAudio(): Observable<any>;

    canStartPublishVideo(): Observable<boolean>;
    startPublishVideo(data:any): Observable<any>;
    unpublishVideo(): Observable<any>;

    getLadyVideoStateCollection():void;
    getOnlineUsers(): Promise<string[]>;

    subscribeAudio(broadcasterId: string): Observable<StartMediaSubscriptionResult>;
    unsubscribeAudio(): Observable<StopMediaSubscriptionResult>;

    subscribeVideo(broadcasterId: string): Observable<StartMediaSubscriptionResult>;
    unsubscribeVideo(): Observable<StopMediaSubscriptionResult>;

    removePublishRoom(userid: string, broadcastUri: string):void;// TODO what is this ? Possibly candidate to remove

    onManSelectedContact(selectedId:string):void;

    cleanUpOldChats(): void;
}