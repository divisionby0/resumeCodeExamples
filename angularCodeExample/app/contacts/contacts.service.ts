import {Injectable, Inject} from "@angular/core";
import {SocketEvent} from "../socket/SocketEvent";
import {HttpResponse} from "@angular/common/http";
import {EventBus} from "../lib/events/EventBus";
import {AppEvent} from "../AppEvent";
import {SortContactsPipe} from "./sort/sortContacts.pipe";
import {Subject, Observable} from "rxjs/index";
import {SortContacts} from "./sort/SortContacts";
import {ICurrentContact} from "./ICurrentContact";
import {IContactNameProvider} from "./contact/IContactNameProvider";
import {Contact} from "./contact/Contact";
import {ContactEvent} from "./contact/ContactEvent";
import {UserType} from "./UserType";
import {ConversationService} from "../conversation/conversation.service";
import {RefreshLadiesTimer} from "./timers/RefreshLadiesTimer";
import {IBackend} from "../backend/IBackend";
import {IContactByIdProvider} from "./IContactByIdProvider";
import {InfoService} from "../info/InfoService";
import {InfoType} from "../info/InfoType";
import {GlobalSelectedContactProvider} from "./GlobalSelectedContactProvider";
import {ISocket} from "../socket/ISocket";
import {DialogService} from "../modal/dialog.service";
import {InfoDisplay} from "../info/InfoDisplay";
import {DialogType} from "../modal/dialog/DialogType";
import {IContactRemover} from "./IContactRemover";
import {OutgoingMediaVO} from "../streaming/OutgoingMediaVO";
import {MediaState} from "./contact/states/MediaState";
import {IActiveMediaSubscriptionsProvider} from "../streaming/IActiveMediaSubscriptionsProvider";
import {ISelfContact} from "./ISelfContact";

@Injectable({
  providedIn: 'root'
})
export class ContactsService implements ISelfContact, IContactNameProvider, IContactByIdProvider, ICurrentContact, IContactRemover{
  private contactsSubject: Subject<Contact[]>;
  private currentContactChangedListener: Subject<Contact>;
  private contactRemovedListener: Subject<Contact>;

  private selfDataReadySubject: Subject<Contact>;

  private additionalContacts: Contact[];
  private additionalContactsSubject: Subject<void>;
  public contactsFromServer: Contact[];
  
  private contacts: Contact[];
  
  private onlineContactsMap: { [userId: number]: boolean };
  private onlineContactsMapSubject: Subject<{ [userId: number]: boolean }>;
  private contactsFromOnline: Contact[];
  private currentRemoteContact: Contact;
  private refreshContactsTimer: number;

  private selfContact:Contact;

  private sortContacts:SortContacts;
  private refreshLadiesTimer:RefreshLadiesTimer;

  private adminId:string = "-100";
  private adminContact:Contact;

  private serverSideContactsCollection:Contact[];
  private temporaryContactsCollection:Contact[] = [];

  private outAudioStates:OutgoingMediaVO[] = [];
  private outVideoStates:OutgoingMediaVO[] = [];

  private currentMyVideoSubscriber:string;

  private contactIdToAutoSelect:string;
  private autoSelectionContactSubject:Subject<string> = new Subject<string>();

  private contactsAudioStates:any[];
  private contactsVideoStates:any[];

  public constructor(@Inject("backendService") private backendService: IBackend,
                     @Inject("ISocket") private socketService: ISocket,
                     @Inject("IActiveMediaSubscriptionsProvider") private streamingService: IActiveMediaSubscriptionsProvider,
                     private conversationService:ConversationService,
                     private infoService:InfoService,
                     private dialog:DialogService,
                     private sorter:SortContactsPipe) {
    this.contactsSubject = new Subject<Contact[]>();
    this.currentContactChangedListener = new Subject<Contact>();
    this.contactRemovedListener = new Subject<Contact>();
    this.onlineContactsMapSubject = new Subject<{ [userId: number]: boolean }>();
    this.contacts = [];
    this.onlineContactsMap = {};
    this.contactsFromOnline = [];
    this.currentRemoteContact = null;
    this.additionalContacts = [];
    this.additionalContactsSubject = new Subject();

    this.selfDataReadySubject = new Subject<Contact>();
    
    EventBus.addEventListener(SocketEvent.ON_SOCKET_CONNECTED, ()=>this.onSocketConnected());
    EventBus.addEventListener(SocketEvent.ON_AUDIO_STREAMS_COLLECTION, (data:any[])=>this.onContactsAudioStates(data));
    EventBus.addEventListener(SocketEvent.ON_USER_AUDIO_PUBLISH_STATE_CHANGED, (data:any)=>this.onContactAudioStateChanged(data));
    
    EventBus.addEventListener(SocketEvent.ON_VIDEO_STREAMS_COLLECTION, (data:any[])=>this.onContactsVideoStates(data));
    EventBus.addEventListener(SocketEvent.ON_USER_VIDEO_PUBLISH_STATE_CHANGED, (data:any)=>this.onContactVideoStateChanged(data));
    
    EventBus.addEventListener(SocketEvent.ON_VIDEO_HAS_BEEN_SUBSCRIBED, (subscriberId:string)=>this.onVideoSubscribed(subscriberId));
    EventBus.addEventListener(SocketEvent.ON_VIDEO_HAS_BEEN_UNSUBSCRIBED, (subscriberId:string)=>this.onVideoUnSubscribed(subscriberId));

    EventBus.addEventListener(SocketEvent.ON_DUPLICATE_CONNECTION_PREV_SOCKET_DISCONNECTED, ()=>this.onDisconnectOnConnectionDuplication());
    EventBus.addEventListener(SocketEvent.ADMIN_DROPPED, ()=>this.onAdminDropped());
    EventBus.addEventListener(SocketEvent.USER_MOOD_CHANGED, (data:any)=>this.onUserMoodChanged(data));

    this.sortContacts = new SortContacts(this.sorter, this.contacts);
    this.createAdminContact();
  }

  public setContactIdToAutoSelect(id:string):void{
    this.contactIdToAutoSelect = id;
  }

  private onContactsAudioStates(data:any[]):void{
    this.contactsAudioStates = data;
    if(this.contacts && this.contacts.length > 0){
      var i:number;
      var total:number = data.length;
      for(i=0; i<total; i++){
        this.onContactAudioStateChanged(data[i]);
      }
    }
  }

  private onUserMoodChanged(data:any):void{
    this.log("onUserMoodChanged data:",data);
    const userId:string = data.userId;
    if(this.hasContactWithId(userId)){
      this.getContactById(userId).setMood(data.mood);
    }
  }

  private onContactAudioStateChanged(data:any):void{
    //...
  }

  private updateSavedOutAudioState(data:any, collection:any[]):void{
    //...
  }

  private onContactsVideoStates(data:any[]):void{
    //...
  }

  private onContactVideoStateChanged(data:any):void{
//...
  }

  private updateSavedOutVideoState(data:any, collection:any[]):void{
    const contactId:string = data.id;

    const item:any[] = collection.filter(contactToCheck => contactToCheck.id === contactId);

    if(item[0] && item[0].state!=data.state){
      item[0].state = data.state;
      item[0].name = data.name;
      item[0].uri = data.uri;
    }
  }

  private onVideoSubscribed(data:any):void{
    //...
  }

  private onVideoUnSubscribed(data:any):void{
   //...
  }

  private createAdminContact():void{
    if(this.adminContact){
      this.adminContact.avatar = "assets/images/adminAvatar.jpg";
      this.adminContact.setUserType(UserType.ADMIN);
    }
  }

  public init(selfContact:Contact, corrId?:string):void{
    this.selfContact = selfContact;
    var that = this;
    if(corrId){
      this.addContactById(corrId).then(()=>{
        that.startRefreshContactsTimer();
      }, (error)=>{
        this.infoService.showSpecificInfo(InfoType.CORRESPONDENT_ID_NOT_FOUND, "Contact not found", corrId);
        that.startRefreshContactsTimer();
      });
    }
    else{
      this.startRefreshContactsTimer();
    }
    
    this.selfContact.getSelfContactOutOfMoneySubject().subscribe(()=>{
      const totalContacts:number = this.contacts.length;
      let i:number;
      for(i=0 ;i<totalContacts; i++){
        const currentContact:Contact = this.contacts[i];
        currentContact.setMediaEnabled(false);
      }
    });

    this.selfContact.getOutgoingVideoChangedListener().subscribe((outVideoState:OutgoingMediaVO)=>{
      if(outVideoState.getState() == MediaState.NORMAL || outVideoState.getState() == MediaState.DISABLED){
        if(this.currentMyVideoSubscriber){
          this.onVideoUnSubscribed({userId:this.currentMyVideoSubscriber});
        }
      }
    });
    
    this.selfDataReadySubject.next(this.selfContact);
  }
  
  public destroy():void{
    //...
  }
  
  public getAutoSelectionContactSubject():Subject<string>{
    return this.autoSelectionContactSubject;
  }
  
  public refresh():void{
    if(this.refreshLadiesTimer){
      this.refreshLadiesTimer.refresh();
    }
  }

  private startRefreshContactsTimer():void{
    if(this.selfContact.getUserType() == UserType.MAN){
      this.refreshLadiesTimer = new RefreshLadiesTimer(this.backendService, (response:HttpResponse<string>)=>this.onContactsResponse(response));
    }
  }

  private onContactsResponse(data:HttpResponse<string>):void{
    //...
  }

  private onContacts(collection:Contact[]):void{
    //...
  }

  public setCurrentContact(contact: Contact): void {
    if(this.currentRemoteContact){
      this.currentRemoteContact.setHasActiveTextChat(false);
      this.conversationService.stopTextChat();
      this.conversationService.onUnsubscribeRemoteVideoRequest();
      // TODO unsubscribe remote audio
    }
    
    this.currentRemoteContact = contact;
    this.currentRemoteContact.select();

    
    this.log("set current contact");
    this.unselectContactsExcept(this.currentRemoteContact);
    this.currentContactChangedListener.next(this.currentRemoteContact);
    this.sortContacts.execute();
    
    this.socketService.onManSelectedContact(this.currentRemoteContact.getId());
    
    EventBus.dispatchEvent(ContactEvent.CONTACT_SELECTED, this.currentRemoteContact);
  }
  
  public getCurrentContact(): Contact {
    return this.currentRemoteContact;
  }

  public hasCurrentContact():boolean{
    if(this.currentRemoteContact){
      return true;
    }
    else{
      return false;
    }
  }
  
  private onLoginComplete():void{
  }
  
  private onSocketConnected():void{
  }

  public getAdditionContacts(): Contact[] {
    return this.additionalContacts ? this.additionalContacts : null;
  }

  public getContacts(): Contact[] {
    return this.contacts;
  }
  public getContactsTotal():number{
    if(this.contacts){
      return this.contacts.length;
    }
    else{
      return 0;
    }
  }

  public getContactById(id:string): Contact {
    if(id == this.adminId){
      return this.adminContact
    }
    else{
      const results:Contact[] = this.contacts.filter(contact => +contact.getId() === +id);
      return results.length > 0 ? results[0] : null;
    }
  }
  public getContactNameById(id:string): string {
    const results = this.contacts.filter(contact => +contact.getId() === +id);
    return results.length > 0 ? results[0].getName() : null;
  }
  public hasContactWithId(id:string):boolean{
    var contact:Contact = this.getContactById(id);
    if(contact){
      return true;
    }
    else{
      return false;
    }
  }

  public addContactById(id:string):Promise<void>{
    var that = this;
    return new Promise<void>((resolve, reject)=>{

      const hasContact:boolean = that.hasContactWithId(id);

      if(hasContact){
        this.socketService.sendUnbanContact(id).subscribe((data)=>{
          
        });
        resolve();
      }
      else{
        this.backendService.getSingleContactLady(id).subscribe((response:HttpResponse<string>)=>{
          //...
        });
      }
    }) as any; //TODO without 'as any' IDE shows error 'Returned expression type PromiseConstructor is not assignable to type Promise<Contact>'
  }

  public removeContact(id:string):void{
    //...
  }

  public appendContact(contact: Contact): void {
    this.contacts.push(contact);
    this.contactsSubject.next(this.contacts);
    this.sortContacts.setCollection(this.contacts);
  }

  private setContactsLadiesFromArray(array: Contact[]): void {
  }

  private onLoggedOut():void{
    this.log("Im logged out from site !!!!");
    EventBus.dispatchEvent(AppEvent.ON_LOGGED_OUT, {});
    //this.refreshContactsStop();
  }

  private clearContacts():void{
    //...
  }

  private onDisconnectOnConnectionDuplication():void{
    this.log("onDisconnectOnConnectionDuplication() Stopping refresh contacts interval");
    this.refreshLadiesTimer.stop();
    this.clearContacts();
  }
  private onAdminDropped():void{
    this.refreshLadiesTimer.stop();
    this.clearContacts();
  }

  private log(value:any, ...rest:any[]):void{
    EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
  }

  private getClassName():string{
    return "ContactsService";
  }
}
