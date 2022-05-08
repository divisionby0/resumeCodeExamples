import {Component, OnInit, ViewChild, EventEmitter, Output} from '@angular/core';
import {InvitationsService} from "../../messages/invitations/invitations.service";
import {EventBus} from "../../lib/events/EventBus";
import {MobMenuEvent} from "../MobMenuEvent";
import {ContactsService} from "../../contacts/contacts.service";
import {AppEvent} from "../../AppEvent";
import {ConversationService} from "../../conversation/conversation.service";
import {Subscription} from "rxjs/index";
import {InvitationsEvent} from "../../messages/invitations/InvitationsEvent";
import {MIN_APP_WIDTH_TO_USE_SELF_VIDEO_IN_CONVERSATION, MANUAL_VIDEO_URL} from "../../constants/view.constants";
import {Contact} from "../../contacts/contact/Contact";
import {IFreeMinuteProvider} from "../../contacts/contact/IFreeMinuteProvider";
import {MediaSubscriptionState} from "../../contacts/contact/MediaSubscriptionState";
import {DialogService} from "../../modal/dialog.service";
import {DialogContentType} from "../../modal/dialog/DialogContentType";
import {DialogType} from "../../modal/dialog/DialogType";
import {VideoViewEvent} from "../../video/VideoViewEvent";

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss']
})
export class MobileMenuComponent implements OnInit{
  @Output() ban:EventEmitter<void>;
  //@Output() onExpand:EventEmitter<void> = new EventEmitter<void>();
  //@Output() onCollapse:EventEmitter<void> = new EventEmitter<void>();
  public totalInvitations:number = 0;
  public invitationsTotalVisible:boolean = false;
  public chatSelected:boolean = false;

  public selectedButtonName:string = "contacts";
  public expanded:boolean = false;

  private selfContactChangedListener:Subscription;
  public balance:number = 0;
  public selfVideoVisible:boolean = false;
  
  public currentRemoteContactAvatar:string;
  public selfContact:Contact;

  public freeMinuteAvailable:boolean = false;

  public manualUrl:string = "#";

  private remoteContactFreeMinuteSubscription:Subscription;

  constructor(private contactsService:ContactsService,
              private invitationsService:InvitationsService,
              private conversationService:ConversationService,
              private dialogService:DialogService) {
    this.ban = new EventEmitter<void>();
    this.contactsService.getCurrentContactChangedListener().subscribe((contact:Contact)=>this.onContactChanged(contact));
    this.conversationService.getRemoteContactChangedListener().subscribe((remoteContact:IFreeMinuteProvider)=>this.onRemoteContactChanged(remoteContact));
    this.invitationsService.getAllInvitationsTotalChangedListener().subscribe((total:number)=>this.onTotalInvitationsChanged(total));

    this.selfContactChangedListener = this.conversationService.getSelfContactChangedListener().subscribe((contact:Contact)=>this.onSelfContactChanged(contact));

    EventBus.addEventListener(MobMenuEvent.CHAT_SELECTED, ()=>this.onChatSelected());
    EventBus.addEventListener(AppEvent.TOGGLE_MOB_MENU, ()=>this.onToggleMenu());
    EventBus.addEventListener(InvitationsEvent.ON_HEADER_CLICKED, ()=>this.showMenu());
    EventBus.addEventListener(AppEvent.APP_WIDTH_CHANGED, (appWidth)=>this.onAppWidthChanged(appWidth));
    EventBus.addEventListener(AppEvent.ON_INPUT_FOCUS_IN, ()=>this.onInputFocusIn());
    EventBus.addEventListener(VideoViewEvent.ON_REMOTE_VIDEO_CAME_FULL_SCREEN, ()=>this.onRemoteVideoCameFullscreen());
  }

  public ngOnInit(): void {
    this.manualUrl = MANUAL_VIDEO_URL;
  }

  public onChatSelected():void{
    this.chatSelected = true;
    this.selectedButtonName = "chat";
    this.expanded = false;
    this.onExpandedStateChanged();
  }
  public onContactsSelected():void{
    this.chatSelected = false;
    this.selectedButtonName = "contacts";
    this.expanded = false;
    this.onExpandedStateChanged();
    EventBus.dispatchEvent(MobMenuEvent.CONTACTS_SELECTED, null);
  }
  public onBannedContactsSelected():void{
    this.dialogService.show("Banned men","", DialogContentType.BANNED_CONTACTS, DialogType.OK);
  }
  public onServicesSelected():void{
    
  }
  public onInvitationsSelected():void{
    if(this.invitationsService.hasUnreadInvitations()){
      this.chatSelected = false;
      this.selectedButtonName = "invitations";
      this.expanded = false;
      this.onExpandedStateChanged();
      EventBus.dispatchEvent(MobMenuEvent.INVITATIONS_SELECTED, null);
    }
  }
  public onFinanceSelected():void{
  }
  public onMediaSelected():void{
    this.dialogService.show("Bought media","", DialogContentType.BOUGHT_MEDIA, DialogType.OK);
  }
  
  public onRemoteVideoStarted():void{
    this.selectedButtonName = "chat";
    this.chatSelected = true;
    this.expanded = false;
    this.onExpandedStateChanged();
  }

  public onStopTextChat():void{
    this.conversationService.stopTextChat();
  }
  public onBanClicked():void{
    this.ban.emit();
  }

  private onSelfContactChanged(contact:Contact):void{
    this.selfContact = contact;
    setTimeout(()=>this.onToggleMenu(), 500);
    this.balance = contact.getBalance();
    this.selfContactChangedListener.unsubscribe();
    contact.getBalanceChangedListener().subscribe((balance:number)=>this.onBalanceChanged(balance));
  }

  private onBalanceChanged(balance:number):void{
    this.balance = balance;
  }

  private onContactChanged(contact:Contact):void{
    if(this.expanded){
      this.expanded = false;
      this.onExpandedStateChanged();
    }
    this.selectedButtonName = "chat";
    this.chatSelected = true;
  }

  private showMenu():void{
    if(this.expanded){
      this.onToggleMenu();
    }
  }

  private onRemoteContactChanged(remoteContact:IFreeMinuteProvider):void{
    //console.log("onRemoteContactChanged remoteContact=",remoteContact);

    if(this.remoteContactFreeMinuteSubscription){
      this.remoteContactFreeMinuteSubscription.unsubscribe();
    }

    if(remoteContact){
      this.freeMinuteAvailable = remoteContact.hasFreeMinute;
      this.remoteContactFreeMinuteSubscription =  remoteContact.getFreeMinuteTextChatPaymentListener().subscribe((hasFreeMinute:boolean)=>this.onRemoteHasFreeMinuteChanged(hasFreeMinute));
    }
    else{
      // remote contact is null - maybe it was banned and removed
      this.selectContacts();
    }
  }

  private selectContacts():void{
    //console.error("auto select contacts after prev contact removed not implemented yet");
    this.onContactsSelected();
  }

  private onRemoteHasFreeMinuteChanged(hasFreeMinute:boolean):void{
    this.freeMinuteAvailable = hasFreeMinute;
  }

  private onExpandedStateChanged():void{
    if(this.expanded){
      EventBus.dispatchEvent(MobMenuEvent.ON_MOBILE_MENU_EXPANDED, null);
    }
    else{
      EventBus.dispatchEvent(MobMenuEvent.ON_MOBILE_MENU_COLLAPSED, null);
    }
  }
  
  private onAppWidthChanged(appWidth:number):void{
    if(appWidth < MIN_APP_WIDTH_TO_USE_SELF_VIDEO_IN_CONVERSATION ){
      //this.selfVideoVisible = true;
    }
    else{
      //this.selfVideoVisible = false;
    }
  }
  private onToggleMenu():void{
    this.expanded=!this.expanded;
    this.onExpandedStateChanged();
  }

  private onInputFocusIn():void{
    this.expanded=false;
    this.onExpandedStateChanged();
  }

  private onRemoteVideoCameFullscreen():void{
    this.expanded=false;
    this.onExpandedStateChanged();
  }

  private onTotalInvitationsChanged(total:number):void{
    this.totalInvitations = total;

    if(this.totalInvitations > 0){
      this.invitationsTotalVisible = true;
    }
    else{
      this.invitationsTotalVisible = false;
    }
  }
}
