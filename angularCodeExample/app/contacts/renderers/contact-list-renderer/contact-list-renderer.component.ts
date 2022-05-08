import {
    Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, AfterViewChecked,
    AfterContentInit
} from '@angular/core';
import {IContactListRenderer} from "../IContactListRenderer";
import {IContactList} from "../../contacts/IContactList";
import {Contact} from "../../contact/Contact";
import {OutgoingMediaVO} from "../../../streaming/OutgoingMediaVO";
import {MediaState} from "../../contact/states/MediaState";
import {UserType} from "../../UserType";
import {FileUtils} from "../../../utils/file/FileUtils";
import {Subscription} from "rxjs/index";
import {environment} from "../../../../environments/environment";
import {EventBus} from "../../../lib/events/EventBus";
import {SocketEvent} from "../../../socket/SocketEvent";

@Component({
  selector: 'app-contact-list-renderer',
  templateUrl: './contact-list-renderer.component.html',
  styleUrls: ['./contact-list-renderer.component.scss']
})
export class ContactListRendererComponent implements OnInit, OnChanges, AfterViewInit, AfterContentInit, IContactListRenderer {
  @Input() contact:Contact;
  @Input() parentComponent:IContactList;

  public static NORMAL:string = "NORMAL";
  public static SELECTED:string = "SELECTED";
  public static BANED:string = "BANED";

  public controlsVisible:boolean = false;
  public audioGreenIconVisible:boolean = false;
  public audioBusyIconVisible:boolean = false;
  public audioActiveIconVisible:boolean = false;
  public videoIconVisible:boolean = false;
  
  public hasFreeMinute:boolean = false;
  
  private normalCssClass:string = "contactListRenderer";
  private selectedCssClass:string = "contactListRendererSelected";
  private banedCssClass:string = "contactListRendererBaned";
  public cssClasses:string[];
  public location:string;

  public avatarUrl:string;

  public hasReadMessageBackendMockButton:boolean = false;
  public hasActiveTextChat:boolean = false;
  private hasActiveTextChatSubscription:Subscription;

  private locationMaxCharacters:number = 12;
  
  public unreadMessageCounterVisible:boolean = false;
  public unreadMessageCounterValueString:string = "";
  private totalUnreadMessages:number = 120;
  
  private currentState:string;

  private ladyAvatarErrorSourceUrl:string = "assets/images/ladyAvatarError.png";
  private manAvatarErrorSourceUrl:string = "assets/images/manAvatarError.png";

  private audioStateChangedSubscription:Subscription;
  private videoStateChangedSubscription:Subscription;
  
  private remotePersonReceivingAudioSubscription:Subscription;
  private remotePersonReceivingVideoSubscription:Subscription;

  public remotePersonReceivingAudio:boolean = false;
  public remotePersonReceivingVideo:boolean = false;

  public contactAnimationUrl:string;
  public contactAnimationVisible:boolean;
  
  public previewAnimationClass:string = "";
  
  constructor() {
    this.currentState = ContactListRendererComponent.NORMAL;
  }

  public onImageSourceUndefined(event:any):void{
    var imageExists:boolean = FileUtils.imageExists(this.avatarUrl);

    if(!imageExists){
      if(this.contact.getUserType() == UserType.MAN){
        this.avatarUrl = this.manAvatarErrorSourceUrl;
      }
      else{
        this.avatarUrl = this.ladyAvatarErrorSourceUrl;
      }
    }
  }

  public getUserId():string{
    return this.contact.getId();
  }
  
  public ban():void{
    this.parentComponent.onBanContactRequest(this.contact);
  }
  public remove():void{
    this.parentComponent.onRemoveContactRequest(this.contact);
  }

  public onClicked():void{
    this.parentComponent.onContactSelected(this.contact.getId());
  }
  public onMouseOver():void{
    this.controlsVisible = true;
  }
  public onMouseOut():void{
    this.controlsVisible = false;
  }

  public ngOnChanges(changes:SimpleChanges):void {
    this.parseLocation();
    this.parseUnreadMessages();
  }

  public ngOnInit(): void {
    this.createPropertyChangedListeners();

    this.parseLocation();
    this.parseUnreadMessages();
    this.parseMediaStates();
    this.parseFreeMinute();
    this.onStateChanged();

    if(this.contact){
      if(this.contact.isSelected()){
        this.currentState = ContactListRendererComponent.SELECTED;
      }
      this.avatarUrl = this.contact.avatar;

      this.remotePersonReceivingAudio = this.contact.getReceivingAudio();
      this.remotePersonReceivingVideo = this.contact.getReceivingVideo();
    }

    if(!environment.production){
      this.hasReadMessageBackendMockButton = true;
    }
  }

  public ngAfterViewInit():void {
    //...
  }

  public ngAfterContentInit():void {
    if(this.contact && this.contact.isSelected()){
      this.currentState = ContactListRendererComponent.SELECTED;
    }
    this.onStateChanged();
  }

  public onReadMessageBackendMock():void{
    console.log("onReadMessageBackendMock()");
    EventBus.dispatchEvent(SocketEvent.ON_START_CHAT_FROM_INVITE, {
      corrId: this.contact.getId()
    });
  }

  public onAvatarMouseOver():void{
    this.updateContactAnimationUrl();
    const previewExists:boolean = FileUtils.imageExists(this.contactAnimationUrl);
    var canShowPreview:boolean = previewExists==true && this.videoIconVisible == true;
    if(canShowPreview){
      this.previewAnimationClass = "previewAnimationHovered";
      this.contactAnimationVisible = true;
    }
  }

  public onAvatarMouseOut():void{
    this.previewAnimationClass = "";
    this.contactAnimationVisible = false;
  }

  private updateContactAnimationUrl():void{
    var d:Date = new Date();
    this.contactAnimationUrl = environment.animationsBaseUrl + this.contact.getId()+".gif?"+d.getTime();
  }

  private createPropertyChangedListeners():void{
    var that = this;
    this.contact.getUnreadMessagesNumChangedListener().subscribe((totalUnreadMessages:number)=>that.onUnreadMessagesNumChanged(totalUnreadMessages));
    this.contact.getSelectedStateChangedListener().subscribe((selected:boolean)=>that.onSelectedStateChanged(selected));
    
    // out media states
    if(this.audioStateChangedSubscription){
      this.audioStateChangedSubscription.unsubscribe();
      this.audioStateChangedSubscription = null;
    }
    this.audioStateChangedSubscription = this.contact.getOutgoingAudioChangedListener().subscribe((outAudioState:OutgoingMediaVO)=>this.onOutAudioStateChanged(outAudioState));

    if(this.videoStateChangedSubscription){
      this.videoStateChangedSubscription.unsubscribe();
      this.videoStateChangedSubscription = null;
    }
    this.videoStateChangedSubscription = this.contact.getOutgoingVideoChangedListener().subscribe((outVideoState:OutgoingMediaVO)=>this.onOutVideoStateChanged(outVideoState));

    if(this.remotePersonReceivingAudioSubscription){
      this.remotePersonReceivingAudioSubscription.unsubscribe();
      this.remotePersonReceivingAudioSubscription = null;
    }
    this.remotePersonReceivingAudioSubscription =  this.contact.getReceivingAudioSubject().subscribe((receivingAudio:boolean)=>{
      this.remotePersonReceivingAudio = receivingAudio;
    });

    if(this.remotePersonReceivingVideoSubscription){
      this.remotePersonReceivingVideoSubscription.unsubscribe();
      this.remotePersonReceivingVideoSubscription = null;
    }
    this.remotePersonReceivingVideoSubscription =  this.contact.getReceivingVideoSubject().subscribe((receivingVideo:boolean)=>{
      this.remotePersonReceivingVideo = receivingVideo;
    });

    
    if(this.hasActiveTextChatSubscription){
      this.hasActiveTextChatSubscription.unsubscribe();
      this.hasActiveTextChatSubscription = null;
    }
    this.hasActiveTextChatSubscription = this.contact.getActiveTextChatAvailabilityListener().subscribe((hasActiveTextChat:boolean)=>{
      this.hasActiveTextChat = hasActiveTextChat;
    });
    this.hasActiveTextChat = this.contact.hasActiveTextChat();
    
    this.contact.getFreeMinuteTextChatPaymentListener().subscribe((hasFreeMinute:boolean)=>this.onHasFreeMinuteChanged(hasFreeMinute));
    //this.data.getOnlineStateChangedListener().subscribe((online:boolean)=>that.onOnlineStateChanged(online));
  }
  
  private onUnreadMessagesNumChanged(total:number):void{
    this.totalUnreadMessages = total;
    this.updateTotalUnreadMessagesIcon();
  }
  private onSelectedStateChanged(selected:boolean):void{
    switch(selected){
      case true:
          this.currentState = ContactListRendererComponent.SELECTED;
        this.createSelectedStateCss();
            break;
      case false:
        this.currentState = ContactListRendererComponent.NORMAL;
        this.createNormalStateCss();
            break;
    }
  }

  private parseLocation():void{
    this.location = this.contact.from;

    if(this.location.length > this.locationMaxCharacters){
      this.location = this.location.substr(0, this.locationMaxCharacters)+ "...";
    }
  }

  private parseUnreadMessages():void{
    this.totalUnreadMessages = (this.contact as Contact).getUnreadMessagesTotal();
    this.updateTotalUnreadMessagesIcon();
  }
  private parseMediaStates():void{
    var audioStateData:OutgoingMediaVO = this.contact.getOutgoingAudioState();
    var videoStateData:OutgoingMediaVO = this.contact.getOutgoingVideoState();
    
    this.onOutAudioStateChanged(audioStateData);
    this.onOutVideoStateChanged(videoStateData);
  }
  private parseFreeMinute():void{
    this.hasFreeMinute = this.contact.isFreeMinuteTextChatPaymentAvailable();
  }

  private updateTotalUnreadMessagesIcon():void{
    if(this.currentState == ContactListRendererComponent.SELECTED || this.currentState == ContactListRendererComponent.BANED){
      this.unreadMessageCounterVisible = false;
      return;
    }

    if(this.totalUnreadMessages > 10){
      this.unreadMessageCounterValueString = "10+";
      this.unreadMessageCounterVisible = true;
    }
    else if(this.totalUnreadMessages == 0){
      this.unreadMessageCounterVisible = false;
    }
    else{
      this.unreadMessageCounterValueString = this.totalUnreadMessages.toString();
      this.unreadMessageCounterVisible = true;
    }
  }

  private onStateChanged():void{
    switch(this.currentState){
      case ContactListRendererComponent.NORMAL:
          this.createNormalStateCss();
            break;
      case ContactListRendererComponent.SELECTED:
          this.createSelectedStateCss();
            break;
      case ContactListRendererComponent.BANED:
          this.createBanedStateCss();
            break;
    }
  }
  
  private onOutAudioStateChanged(outAudioState:OutgoingMediaVO):void{
    var state:string = outAudioState.getState();
    if(state == MediaState.NORMAL){
      this.audioGreenIconVisible = true;
      this.audioActiveIconVisible = false;
      this.audioBusyIconVisible = false;
    }
    else if(state == MediaState.ACTIVE){
      this.audioGreenIconVisible = false;
      this.audioActiveIconVisible = true;
      this.audioBusyIconVisible = false;
    }
    else if(state == MediaState.USED){
      this.audioGreenIconVisible = false;
      this.audioActiveIconVisible = false;
      this.audioBusyIconVisible = true;
    }
    else{
      this.audioGreenIconVisible = false;
      this.audioActiveIconVisible = false;
      this.audioBusyIconVisible = false;
    }
  }

  private onOutVideoStateChanged(outVideoState:OutgoingMediaVO):void{

    let state:string = outVideoState.getState();
    if(state == MediaState.NORMAL || state == MediaState.ACTIVE){
      this.videoIconVisible = true;
    }
    else{
      this.videoIconVisible = false;
    }
  }
  
  private onHasFreeMinuteChanged(hasFreeMinute:boolean):void{
    this.hasFreeMinute = hasFreeMinute;
    //console.log("onHasFreeMinuteChanged "+hasFreeMinute);
  }
  
  private createNormalStateCss():void{
    this.cssClasses = [this.normalCssClass];
  }
  private createSelectedStateCss():void{
    this.createNormalStateCss();
    this.cssClasses.push(this.selectedCssClass);
  }
  private createBanedStateCss():void{
    this.createNormalStateCss();
    this.cssClasses.push(this.banedCssClass);
  }
}
