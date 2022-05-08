import {Injectable, Inject} from '@angular/core';
import {Subject, Observable, Subscription} from "rxjs/index";
import {EventBus} from "../lib/events/EventBus";
import {ISelfDataProvider} from "./ISelfDataProvider";
import {Contact} from "../contacts/contact/Contact";
import {ContactEvent} from "../contacts/contact/ContactEvent";
import {ISocket} from "../socket/ISocket";
import {IRemoteContactProvider} from "./IRemoteContactProvider";
import {IBackend} from "../backend/IBackend";
import {HttpResponse} from "@angular/common/http";
import {InfoService} from "../info/InfoService";
import {InfoType} from "../info/InfoType";
import {DialogService} from "../modal/dialog.service";
import {StartMediaSubscriptionResult} from "../streaming/client/StartMediaSubscriptionResult";
import {MediaState} from "../contacts/contact/states/MediaState";
import {OutgoingMediaVO} from "../streaming/OutgoingMediaVO";
import {StopMediaSubscriptionResult} from "../streaming/client/StopMediaSubscriptionResult";
import {SocketEvent} from "../socket/SocketEvent";
import {StartVideoSubscriptionConfirmable} from "../confirmables/StartVideoSubscriptionConfirmable";
import {StartAudioSubscriptionConfirmable} from "../confirmables/StartAudioSubscriptionConfirmable";
import {IConversationTypeStartedEventReceiver} from "../messages/textchat/text-chat/IConversationTypeStartedEventReceiver";
import {LogableClass} from "../LogableClass";
import {VideoViewEvent} from "../video/VideoViewEvent";
import {StopMediaPublishingResult} from "../streaming/client/StopMediaPublishingResult";

@Injectable({
  providedIn: 'root'
})
export class ConversationService extends LogableClass implements ISelfDataProvider, IRemoteContactProvider {
  private textChatService:IConversationTypeStartedEventReceiver;
  private remoteContact:Contact;
  private selfContact:Contact;

  private selfContactChangedListener:Subject<Contact> = new Subject();
  private remoteContactChangedListener:Subject<Contact> = new Subject();

  private appErrorListener:Subject<string> = new Subject();

  private socket:ISocket;

  private startAudioSubscriptionResultListener:Subject<StartMediaSubscriptionResult> = new Subject();
  private stopAudioSubscriptionResultListener:Subject<StopMediaSubscriptionResult> = new Subject();
  private audioSubscriptionEnabled:boolean = false;

  private startVideoSubscriptionResultListener:Subject<StartMediaSubscriptionResult> = new Subject();
  private stopVideoSubscriptionResultListener:Subject<StopMediaSubscriptionResult> = new Subject();
  private videoSubscriptionEnabled:boolean = false;


  private textChatStartedListener:Subject<void> = new Subject();
  private textChatStoppedListener:Subject<void> = new Subject();

  private remoteContactOutAudioStateChangedSubscription:Subscription;
  private remoteContactOutVideoStateChangedSubscription:Subscription;

  private remoteContactHasFreeMinuteSubscription:Subscription;

  constructor(@Inject("backendService") private backendService:IBackend,
              private infoService:InfoService) {
    super();
    EventBus.addEventListener(ContactEvent.CONTACT_SELECTED, (contact:Contact)=>this.onContactSelected(contact));
    EventBus.addEventListener(SocketEvent.ON_START_TEXT_CHAT, (contactId:string)=>this.onTextChatStarted(contactId));
    EventBus.addEventListener(SocketEvent.ON_OUTGOING_TEXT_CHAT_PAYMENT_STOPPED, (contactId:string)=>this.onTextChatPaymentStopped(contactId));
    EventBus.addEventListener(SocketEvent.ON_DUPLICATE_CONNECTION_PREV_SOCKET_DISCONNECTED, ()=>this.onDisconnectOnConnectionDuplication());
    EventBus.addEventListener(SocketEvent.ADMIN_DROPPED, ()=>this.onAdminDropped());
  }

  public setTextChatService(textChatService:IConversationTypeStartedEventReceiver):void {
    this.textChatService = textChatService;
  }

  public destroy(error?:string):void {
    if (error) {
      this.appErrorListener.next(error);
    }
  }

  public getRemoteContact():Contact {
    return this.remoteContact;
  }

  public hasRemoteContact():boolean {
    return this.remoteContact != null;
  }

  public getRemoteContactChangedListener():Observable<Contact> {
    return this.remoteContactChangedListener.asObservable();
  }

  public getAppErrorListener():Subject<string> {
    return this.appErrorListener;
  }

  public addToFavourites():void {
    if (this.remoteContact.getFavouriteState() == true) {
      // remove from fav
      this.removeFromFavouritesRequest();
    }
    else {
      // add to fav
      this.addToFavouritesRequest();
    }
  }

  private addToFavouritesRequest():void {
    this.backendService.addToFavourites(this.remoteContact.getId()).subscribe((response:HttpResponse<string>)=> {
      let responseData:string[] = response.body.split("|");
      if (responseData[0] == "OK" && response.status == 200) {
        this.infoService.showSpecificInfo(InfoType.ADDED_TO_FAVOURITES, "Added to favourites", this.remoteContact.getName() + " / " + this.remoteContact.getId());
        this.remoteContact.setFavouriteState(true);
      }
      else if (responseData[0] == "FAIL") {
        this.infoService.showSpecificInfo(InfoType.ADD_TO_FAVOURITES_ERROR, "Error", responseData[1]);
      }
      else {
        this.infoService.showSpecificInfo(InfoType.ADD_TO_FAVOURITES_ERROR, "Error", response.body);
      }
    });
  }

  private removeFromFavouritesRequest():void {
    this.backendService.removeFromFavourites(this.remoteContact.getId()).subscribe((response:HttpResponse<string>)=> {
      let responseData:string[] = response.body.split("|");
      if (responseData[0] == "OK" && response.status == 200) {
        this.infoService.showSpecificInfo(InfoType.REMOVED_FROM_FAVOURITES, "Removed from favourites", this.remoteContact.getName() + " / " + this.remoteContact.getId());
        this.remoteContact.setFavouriteState(false);
      }
    });
  }

  public setSelfContact(contact:Contact):void {
    this.selfContact = contact;
    if (this.socket) {
      this.selfContact.setSocket(this.socket);
    }

    if (this.backendService) {
      this.selfContact.setBackend(this.backendService);
    }

    this.selfContact.getRemoteAudioUnsubscribedSubject().subscribe((unsubscribeResult:StopMediaSubscriptionResult)=> {
      this.onAudioUnsubscribeResult(unsubscribeResult);
    });

    var remoteVideoDisabledSubscription:Subscription = this.selfContact.getRemoteVideoUnsubscribedSubject().subscribe((unsubscribeResult:StopMediaSubscriptionResult)=> {
      this.log("on remote video unsubscribed result:", unsubscribeResult);
      this.onVideoUnsubscribeResult(unsubscribeResult);
    });

    this.selfContact.setInfoService(this.infoService);

    this.selfContactChangedListener.next(this.selfContact);
  }

  public getSelfContact():Contact {
    return this.selfContact;
  }

  public getSelfContactChangedListener():Observable<Contact> {
    return this.selfContactChangedListener.asObservable();
  }

  public onSelfContactBackendCameOffline():void {
    this.selfContact.setIsOnline(false);
    // TODO получается путаница. Я могу просто остановить текстовый чат и, по идее, все остановится, но код остановки нужно переписать на subscription=>subscription=>...
    this.log("Self contact BACKEND came offline");

    this.remoteContact = null;
    this.remoteContactChangedListener.next(this.remoteContact);

    this.destroySelfContact().subscribe(()=>{
    });
  }

  private destroySelfContact():Observable<void> {
    return Observable.create((observer)=>{
      this.log("destroySelfContact");
      this.selfContact.unpublishAudio().subscribe((result:StopMediaPublishingResult)=> {
        this.log("unpublish self audio result: ",result);
        this.selfContact.unpublishVideo().subscribe((result:StopMediaPublishingResult)=> {
          this.log("unpublish self video result: ",result);
          this.selfContact.unsubscribeAudio().subscribe((result:StopMediaSubscriptionResult)=> {
            this.log("unsubscribe remote audio result: ",result);
            this.selfContact.unsubscribeVideo().subscribe((result:StopMediaSubscriptionResult)=> {
              this.log("unsubscribe remote video result: ",result);
              this.selfContact.stopConversation();
              this.selfContact.destroy();
              this.selfContact = null;
              this.selfContactChangedListener.next(this.selfContact);
              observer.next();
            });
          });
        });
      });
    });
  }

  public onContactRemoved(id:string):void {
    if (this.remoteContact && parseInt(id) == parseInt(this.remoteContact.getId())) {
      this.stopTextChat();
      this.remoteContact = null;
      this.remoteContactChangedListener.next(null);
    }
  }

  public setSocket(socket:ISocket):void {
    this.socket = socket;
    if (this.selfContact) {
      this.selfContact.setSocket(socket);
    }

    if (this.remoteContact) {
      this.remoteContact.setSocket(socket);
    }
  }

  public getStartAudioSubscriptionResultListener():Subject<StartMediaSubscriptionResult> {
    return this.startAudioSubscriptionResultListener;
  }

  public getStopAudioSubscriptionResultListener():Subject<StopMediaSubscriptionResult> {
    return this.stopAudioSubscriptionResultListener;
  }

  @StartAudioSubscriptionConfirmable()
  public onSubscribeRemoteAudioRequest(remoteContact:Contact):void {
    this.selfContact.subscribeAudio(this.remoteContact.getId()).subscribe((audioSubscriptionResult:StartMediaSubscriptionResult)=>this.onAudioSubscriptionResult(audioSubscriptionResult));
  }

  public onUnsubscribeRemoteAudioRequest():void {
    if (this.remoteContact) {
      this.selfContact.unsubscribeAudio().subscribe((stopAudioSubscriptionResult:StopMediaSubscriptionResult)=> {
        this.onAudioUnsubscribeResult(stopAudioSubscriptionResult);
      });
    }
  }

  private onAudioSubscriptionResult(audioSubscriptionResult:StartMediaSubscriptionResult):void {
    this.startAudioSubscriptionResultListener.next(audioSubscriptionResult);

    if (!audioSubscriptionResult.isError()) {
      this.audioSubscriptionEnabled = true;
      this.remoteContact.setOutgoingAudioState(new OutgoingMediaVO(MediaState.ACTIVE, audioSubscriptionResult.getResult().streamName, audioSubscriptionResult.getResult().uri));
    }
  }

  private onAudioUnsubscribeResult(stopAudioSubscriptionResult:StopMediaSubscriptionResult):void {
    this.stopAudioSubscriptionResultListener.next(stopAudioSubscriptionResult);

    this.audioSubscriptionEnabled = false;

    if (!stopAudioSubscriptionResult.isError()) {
      var prevOutAudioState:OutgoingMediaVO = this.remoteContact.getOutgoingAudioState();

      if(prevOutAudioState.getState()!=MediaState.DISABLED){
        this.remoteContact.setOutgoingAudioState(new OutgoingMediaVO(MediaState.NORMAL, prevOutAudioState.getStreamName(), prevOutAudioState.getMediaServerUrl()));
      }
    }
  }


  // TODO remoteContact used to inject into Dialog
  @StartVideoSubscriptionConfirmable()
  public onSubscribeRemoteVideoRequest(remoteContact:Contact):void {
    this.selfContact.subscribeVideo(this.remoteContact.getId()).subscribe((videoSubscriptionResult:StartMediaSubscriptionResult)=>this.onVideoSubscriptionResult(videoSubscriptionResult));
  }

  public onUnsubscribeRemoteVideoRequest():void {
    if (this.remoteContact) {

      this.selfContact.unsubscribeVideo().subscribe((stopVideoSubscriptionResult:StopMediaSubscriptionResult)=> {
        this.onVideoUnsubscribeResult(stopVideoSubscriptionResult);
      });
    }
  }

  public getStartVideoSubscriptionResultListener():Subject<StartMediaSubscriptionResult> {
    return this.startVideoSubscriptionResultListener;
  }

  public getStopVideoSubscriptionResultListener():Subject<StopMediaSubscriptionResult> {
    return this.stopVideoSubscriptionResultListener;
  }

  private onVideoSubscriptionResult(videoSubscriptionResult:StartMediaSubscriptionResult):void {
    this.startVideoSubscriptionResultListener.next(videoSubscriptionResult);

    if (!videoSubscriptionResult.isError()) {
      this.videoSubscriptionEnabled = true;
      this.remoteContact.setOutgoingVideoState(new OutgoingMediaVO(MediaState.ACTIVE, videoSubscriptionResult.getResult().streamName, videoSubscriptionResult.getResult().uri));
    }
  }

  private onVideoUnsubscribeResult(stopVideoSubscriptionResult:StopMediaSubscriptionResult):void {
    this.stopVideoSubscriptionResultListener.next(stopVideoSubscriptionResult);

    this.videoSubscriptionEnabled = false;

    if (!stopVideoSubscriptionResult.isError() || stopVideoSubscriptionResult.getError() == "notActive") {
      var prevOutVideoState:OutgoingMediaVO = this.remoteContact.getOutgoingVideoState();
      if(prevOutVideoState.getState()!=MediaState.DISABLED){
        this.remoteContact.setOutgoingVideoState(new OutgoingMediaVO(MediaState.NORMAL, prevOutVideoState.getStreamName(), prevOutVideoState.getMediaServerUrl()));
      }
      else{
        this.log("Contact's "+this.remoteContact.getId()+" prev out video state was DISABLED - no need to set it to NORMAL");
      }
    }
  }

  public stopTextChat():void {
    if (this.selfContact.hasActiveTextChat()) {
      this.selfContact.stopConversation();
      this.onTextChatStopped();
    }
    else {
    }
  }

  public getTextChatStartedListener():Subject<void> {
    return this.textChatStartedListener;
  }

  public getTextChatStoppedListener():Subject<void> {
    return this.textChatStoppedListener;
  }

  public onTextChatStarted(contactId:string):void {
    this.log("onTextChatStarted ", contactId);
    this.textChatStartedListener.next();
    this.selfContact.setHasActiveTextChat(true);
    this.remoteContact.setHasActiveTextChat(true);
  }

  private onTextChatStopped():void {
    
  }

  private onTextChatPaymentStopped(contactId:string):void {
    
  }

  private onContactSelected(contact:Contact):void {
  }

  private onDisconnectOnConnectionDuplication():void {
    
  }

  private onAdminDropped():void {
    
  }
  
  protected getClassName():string{
    return "ConversationService";
  }
}
