import {
    Component, OnInit, AfterViewInit, AfterContentInit, ViewChild, EventEmitter, Output,
    Inject
} from '@angular/core';
import {ConversationService} from "../conversation.service";
import {WindowUtil} from "../../utils/WindowUtil";
import {EventBus} from "../../lib/events/EventBus";
import {AppEvent} from "../../AppEvent";
import {InvitationsService} from "../../messages/invitations/invitations.service";
import {
    MIN_APP_WIDTH_TO_USE_SELF_VIDEO_IN_CONVERSATION,
    NO_REMOTE_CONTACT_SELECTED_AVATAR_URL
} from "../../constants/view.constants";
import {Contact} from "../../contacts/contact/Contact";
import {ContactLifeTimeError} from "../../contacts/contact/ContactLifeTimeError";
import {InfoDisplay} from "../../info/InfoDisplay";
import {DialogType} from "../../modal/dialog/DialogType";
import {InfoType} from "../../info/InfoType";
import {VideoViewEvent} from "../../video/VideoViewEvent";
import {StartMediaSubscriptionResult} from "../../streaming/client/StartMediaSubscriptionResult";
import {RemoteContactBlockComponent} from "../remote-contact-block/remote-contact-block.component";
import {StopMediaSubscriptionResult} from "../../streaming/client/StopMediaSubscriptionResult";
import {BanConfirmable} from "../../confirmables/BanConfirmable";
import {TextChatService} from "../../messages/textchat/text-chat/text-chat.service";
import {IConnectionFailedSubjectProvider} from "../../socket/IConnectionFailedSubjectProvider";
import {StopMediaPublishingResult} from "../../streaming/client/StopMediaPublishingResult";
import {LogableClass} from "../../LogableClass";
import {ContactsService} from "../../contacts/contacts.service";
import {MediaSubscriptionState} from "../../contacts/contact/MediaSubscriptionState";
import {DialogContentType} from "../../modal/dialog/DialogContentType";

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent extends LogableClass implements OnInit, AfterViewInit, AfterContentInit {
  @Output() selfVideoEnabledStateChanged:EventEmitter<boolean>;
  @ViewChild("remoteContactBlock") private remoteContactBlock:RemoteContactBlockComponent;
  public remoteContact:Contact;
  public selfContact:Contact;
  
  public bigStopButtonVisible:boolean = false;
  
  public remoteBlockVisible:boolean = false;
  public selfBlockVisible:boolean = true;

  public toggleMobileMenuButtonVisible:boolean = false;
  public totalInvitations:number = 0;
  public invitationsTotalVisible:boolean = false;
  public isMobile:boolean = false;
  public selfVideoVisible:boolean = false;

  public collapsedVertically:boolean = false;
  public collapsedVerticallyRemoteAvatarUrl:string;
  public cssClasses:string[];

  public remoteVideoFullscreen:boolean = false;
  public selfVideoEnabled:boolean = false;

  public appError:string;
  public appErrorVisible:boolean = false;
  
  public selfBalance:number = 0;
  
  public hasActiveTextChat:boolean = false;
  public hasActiveTextAndAudioChat:boolean = false;
  
  public connectionFailedError:boolean = false;
  
  constructor(private conversationService:ConversationService,
              private invitationsService:InvitationsService,
              private textChatService:TextChatService,
              private contactsService: ContactsService,
              @Inject("IConnectionFailedSubjectProvider") private connectionFailedSubjectProvider: IConnectionFailedSubjectProvider) {
    super();
    var that = this;
    
    this.selfVideoEnabledStateChanged = new EventEmitter<boolean>();
    
    this.conversationService.getRemoteContactChangedListener().subscribe((remoteContact:Contact)=>that.onRemoteContactChanged(remoteContact));
    this.conversationService.getSelfContactChangedListener().subscribe((selfContact:Contact)=>that.onSelfContactChanged(selfContact));

    this.conversationService.getStartAudioSubscriptionResultListener().subscribe((result:StartMediaSubscriptionResult)=>this.onStartAudioSubscriptionResult(result));
    this.conversationService.getStopAudioSubscriptionResultListener().subscribe((result:StopMediaSubscriptionResult)=>this.onStopAudioSubscriptionResult(result));
    
    this.conversationService.getStartVideoSubscriptionResultListener().subscribe((result:StartMediaSubscriptionResult)=>this.onStartVideoSubscriptionResult(result));
    this.conversationService.getStopVideoSubscriptionResultListener().subscribe((result:StopMediaSubscriptionResult)=>this.onStopVideoSubscriptionResult(result));

    this.conversationService.getAppErrorListener().subscribe((error:string)=>this.onAppError(error));

    this.conversationService.getTextChatStartedListener().subscribe(()=>this.onTextChatStarted());
    this.conversationService.getTextChatStoppedListener().subscribe(()=>this.onTextChatStopped());

    this.invitationsService.getAllInvitationsTotalChangedListener().subscribe((total:number)=>this.onTotalInvitationsChanged(total));

    this.connectionFailedSubjectProvider.getConnectionFailedSubject().subscribe(()=>{
      this.connectionFailedError = true;
      this.selfBlockVisible = false;
      this.remoteBlockVisible = false;
    });

    EventBus.addEventListener(AppEvent.CAME_MOBILE, ()=>this.onCameMobile());
    EventBus.addEventListener(AppEvent.CAME_DESKTOP, ()=>this.onCameDesktop());
    EventBus.addEventListener(AppEvent.APP_WIDTH_CHANGED, (width:number)=>this.onAppWidthChanged(width));

    EventBus.addEventListener(AppEvent.ON_INPUT_FOCUS_IN, ()=>this.onInputFocusIn());
    EventBus.addEventListener(AppEvent.ON_INPUT_FOCUS_OUT, ()=>this.onInputFocusOut());
    
    EventBus.addEventListener(VideoViewEvent.ON_REMOTE_VIDEO_CAME_FULL_SCREEN, ()=>this.onRemoteVideoCameFullScreen());
    EventBus.addEventListener(VideoViewEvent.ON_REMOTE_VIDEO_CAME_NORMAL_SCREEN, ()=>this.onRemoteVideoNormalScreen());
  }

  public ngOnInit(): void {
  }

  public ngAfterViewInit():void {
  }

  public ngAfterContentInit():void {
    this.isMobile = WindowUtil.isMobile();
    if(this.isMobile){
      this.toggleMobileMenuButtonVisible = true;
    }
    else{
      this.toggleMobileMenuButtonVisible = false;
    }
  }

  public onMouseOver():void{
    if(this.hasActiveTextChat || this.hasActiveTextAndAudioChat){
      this.bigStopButtonVisible = true;
    }
  }
  public onMouseOut():void{
    this.bigStopButtonVisible = false;
  }
  
  public onStopConversation():void{
    this.hasActiveTextChat = false;
    this.hasActiveTextAndAudioChat = false;
    this.bigStopButtonVisible = false;
    this.conversationService.stopTextChat();
    this.onTextChatStopped();

    // stop subscribe
    // stop publish
    this.selfContact.unsubscribeAudio().subscribe((result:StopMediaSubscriptionResult)=>{
      this.selfContact.unsubscribeVideo().subscribe((result:StopMediaSubscriptionResult)=>{
        this.selfContact.unpublishAudio().subscribe((result:StopMediaPublishingResult)=>{
          this.selfContact.unpublishVideo().subscribe((result:StopMediaPublishingResult)=>{
          });
        })
      })
    })
  }

  public onAddToFavourites():void{
    this.conversationService.addToFavourites();
  }
  
  public onToggleMobileMenuClicked():void{
    EventBus.dispatchEvent(AppEvent.TOGGLE_MOB_MENU, null);
  }

  public onStopTextChat():void{
    this.onStopConversation();
  }

  @BanConfirmable()
  public onBanRemoteContact(contact:Contact):void{
    this.onStopConversation();
    this.contactsService.removeContact(contact.getId());
    this.remoteContactBlock.onContactRemoved();
  }

  public onSelfVideoEnabledStateChanged(value:boolean):void{
    this.selfVideoEnabled = value;
    this.selfVideoEnabledStateChanged.emit(this.selfVideoEnabled);
  }

  private onStopAudioSubscriptionResult(stopAudioSubscriptionResult:StartMediaSubscriptionResult):void{
    this.hasActiveTextAndAudioChat = false;
    this.remoteContactBlock.onStopAudioSubscriptionResult(stopAudioSubscriptionResult);
  }
  
  private onStartVideoSubscriptionResult(startVideoSubscriptionResult:StartMediaSubscriptionResult):void{
    this.remoteContactBlock.onStartVideoSubscriptionResult(startVideoSubscriptionResult);

    if(!startVideoSubscriptionResult.isError() && startVideoSubscriptionResult.getResult().success === true){

      if(!this.hasActiveTextChat){
        this.hasActiveTextChat = true;
        this.conversationService.onTextChatStarted(this.remoteContact.getId());
        this.onTextChatStarted();
      }
    }
  }
  
  private onStopVideoSubscriptionResult(stopVideoSubscriptionResult:StartMediaSubscriptionResult):void{
    this.remoteVideoFullscreen = false;
    EventBus.dispatchEvent(VideoViewEvent.ON_REMOTE_VIDEO_CAME_NORMAL_SCREEN, null);
    this.remoteContactBlock.onStopVideoSubscriptionResult(stopVideoSubscriptionResult);
  }
  
  private onCameMobile():void{
    this.isMobile = true;
    this.toggleMobileMenuButtonVisible = true;
  }
  private onCameDesktop():void{
    this.isMobile = false;
    this.toggleMobileMenuButtonVisible = false;
  }
  private onAppWidthChanged(appWidth:number):void{
    
    if(appWidth > MIN_APP_WIDTH_TO_USE_SELF_VIDEO_IN_CONVERSATION){
      this.isMobile = false;
    }
    else{
      this.isMobile = true;
    }
  }

  private onTotalInvitationsChanged(total:number):void{
    this.totalInvitations = total;

    if(this.toggleMobileMenuButtonVisible){
      if(this.totalInvitations > 0){
        this.invitationsTotalVisible = true;
      }
      else{
        this.invitationsTotalVisible = false;
      }
    }
  }
  
  private onRemoteContactChanged(remoteContact:Contact):void{
  }

  private onSelfContactChanged(selfContact:Contact):void{
    this.selfContact = selfContact;
    if(this.selfContact){
      this.remoteBlockVisible = true;

      // TODO listen to contact's event to show info to user
      this.selfContact.getLifeTimeErrorListener().subscribe((error:ContactLifeTimeError)=>{
        InfoDisplay.getInstance().show(DialogType.OK, InfoType.SIMPLE_ERROR, DialogContentType.TEXT, [error.getMessage()],"Error");
      });

      this.selfBalance = this.selfContact.getBalance();
      this.selfContact.getBalanceChangedListener().subscribe((balance:number)=>this.onSelfBalanceChanged(balance));
      this.selfContact.getAudioSubscriptionStateChangedListener().subscribe((mediaSubscriptionState:string)=>{
        this.onAudioSelfSubscriptionStateChanged(mediaSubscriptionState);
      });
    }
    else{
      this.remoteBlockVisible = false;
    }
  }
  
  private onSelfBalanceChanged(balance:number):void{
    this.selfBalance = balance;
  }
  private onAudioSelfSubscriptionStateChanged(mediaSubscriptionState:string):void{
    if(mediaSubscriptionState == MediaSubscriptionState.STOPPED){
      this.hasActiveTextAndAudioChat = false;
    }
  }
  
  private onInputFocusIn():void{
  }
  
  private onInputFocusOut():void{
  }

  private onRemoteVideoCameFullScreen():void{
    this.remoteVideoFullscreen = true;
  }
  private onRemoteVideoNormalScreen():void{
    this.remoteVideoFullscreen = false;
  }

  private onAppError(error:string):void{
  }
  
  private onTextChatStarted():void{
  }
  
  private onTextChatStopped():void{
    this.hasActiveTextChat = false;
  }

  protected getClassName():string{
    return "ConversationComponent";
  }
}
