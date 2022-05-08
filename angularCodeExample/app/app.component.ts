import {
    Component, OnInit, HostListener, ViewChild, AfterViewInit, AfterViewChecked
} from '@angular/core';
import {WindowUtil} from "./utils/WindowUtil";
import {EventBus} from "./lib/events/EventBus";
import {HideableComponent} from "./HideableComponent";
import {ContactsService} from "./contacts/contacts.service";
import {AppEvent} from "./AppEvent";
import {MobMenuEvent} from "./mobmenu/MobMenuEvent";
import {Settings} from "./Settings";
import {DialogService} from "./modal/dialog.service";
import {InfoDisplay} from "./info/InfoDisplay";
import {ApplicationService} from "./application.service";
import {LogableClass} from "./LogableClass";
import {InfoService} from "./info/InfoService";
import {VideoViewEvent} from "./video/VideoViewEvent";
import {IContactAvatar} from "./contacts/contact/IContactAvatar";
import {ConversationComponent} from "./conversation/conversation/conversation.component";
import {SocketEvent} from "./socket/SocketEvent";
import {environment} from "../environments/environment";
import NoSleep from 'nosleep.js';
import {OnInputFocusListener} from "./OnInputFocusListener";
import {SocketService} from "./socket/socket.service";
import {CookieService} from "./cookie/cookie.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent extends LogableClass implements OnInit, AfterViewInit, AfterViewChecked{
  title = 'client2021aug';

  @ViewChild("textchat") textchat:HideableComponent;
  @ViewChild("contacts") contacts:HideableComponent;
  @ViewChild("conversation") conversation:ConversationComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.detectIsMobile();
  }

  /*
   1380px
   1279px
   810px
   640px
   520px
   440px
   380px
   */
  public isMobile:boolean = false;

  public mobileMenuEnabled:boolean = false;
  
  private heightUnsetClass:string = "heightUnset";
  private leftRowBaseClass:string = "appContentRowLeft";
  private rightRowBaseClass:string = "appContentRowRight";

  public leftRowClass:string[];
  public rightRowClass:string[];

  public version:string;
  public serverVersion:string = "-.-.-";
  public socketTransport: string = "ws";
  public remoteVideoFullscreen:boolean = false;
  public currentSelectedContactAvatar:string;

  public selfVideoEnabled:boolean = false;
  
  private textchatTab:string = "textchat";
  private contactsTab:string = "contacts";
  private invitationsTab:string = "invitations";

  private mobileActiveTab:string;
  private hasSelectedContact:boolean = false;
  //private appInitComplete:boolean = false;

  public debugControlsEnabled:boolean = false;

  private noSleep:NoSleep = new NoSleep();
  private noSleepEnabled:boolean = false;

  constructor(private appService:ApplicationService,
              private dialogService:DialogService,
              private contactsService:ContactsService,
              private infoService:InfoService){

    super();
    
    if(!environment.production){
      this.debugControlsEnabled = true;
    }
    
    //this.log("TEST LOG");
    let that = this;

    window.addEventListener("unhandledrejection", function(promiseRejectionEvent) {
      that.log("Unhandled rejection: ",promiseRejectionEvent);
      try{
        let reason = promiseRejectionEvent.reason;
        if(reason!=undefined){
          that.log("Unhandled promise rejection reason: "+reason);
        }
      }
      catch(error){
      }
    });

    this.version = environment.name + ": " + Settings.getInstance().getVersion();
    
    this.mobileActiveTab = this.contactsTab;
    this.createLeftRowCss();
    this.createRightRowCss();

    EventBus.addEventListener(MobMenuEvent.CHAT_SELECTED, ()=>this.onChatSelected());
    EventBus.addEventListener(MobMenuEvent.CONTACTS_SELECTED, ()=>this.onContactSelected());
    EventBus.addEventListener(MobMenuEvent.INVITATIONS_SELECTED, ()=>this.onInvitationsSelected());

    EventBus.addEventListener(AppEvent.CAME_DESKTOP, ()=>this.onCameDesktop());
    EventBus.addEventListener(AppEvent.CAME_MOBILE, ()=>this.onCameMobile());
    EventBus.addEventListener(MobMenuEvent.CHAT_SELECTED, ()=>this.onMobileChatSelected());

    EventBus.addEventListener(VideoViewEvent.ON_REMOTE_VIDEO_CAME_FULL_SCREEN, ()=>this.onRemoteVideoCameFullScreen());
    EventBus.addEventListener(VideoViewEvent.ON_REMOTE_VIDEO_CAME_NORMAL_SCREEN, ()=>this.onRemoteVideoNormalScreen());

    EventBus.addEventListener(SocketEvent.CONNECTION_CREATED, (serverVersion)=>this.onConnectionCreated(serverVersion));
    EventBus.addEventListener(SocketEvent.TRANSPORT_CHANGED, (transport)=>this.onSocketTransportChanged(transport));

    this.contactsService.getCurrentContactChangedListener().subscribe((contactAvatarProvider:IContactAvatar)=>that.onCurrentContactChanged(contactAvatarProvider));
    new OnInputFocusListener();
  }

  public ngOnInit():void {
    this.initInfoDisplay();
    this.appService.updateDesign();
    this.detectIsMobile();

    window.addEventListener("resize", function(event) {
      setTimeout(()=>{
        WindowUtil.onResize();
      },100);
    });


    //this.infoService.showError("user agent:"+navigator.userAgent, "mobile check");
  }

  public ngAfterViewInit():void {
    let that = this;
    WindowUtil.createResizeListener();

    this.detectIsMobile();

    if(!this.isMobile){
      this.showTextChat();
      this.showContacts();
    }
    
    document.addEventListener('touchstart', ()=>{
      if(!that.noSleepEnabled){
        that.noSleepEnabled = true;
        (that.noSleep as any).enable();
        that.log("no sleep enabled");
      }
    }, false);
  }

  public ngAfterViewChecked():void {
    this.appService.init();
  }

  public manualReconnectRequest():void{
    EventBus.dispatchEvent(AppEvent.MANUAL_RECONNECT, null);
  }
  
  public onSelfVideoEnabledStateChanged(value:boolean):void{
    this.selfVideoEnabled = value;
    //this.selfVideoEnabledStateChanged.emit(this.selfVideoEnabled);
  }

  public onBanFromMobileMenu():void{
    this.conversation.onBanRemoteContact(this.conversation.remoteContact);
  }
  
  private onMobileChatSelected():void{
    this.mobileActiveTab = this.textchatTab;
  }

  private onCurrentContactChanged(contactAvatarProvider:IContactAvatar):void{
    this.hasSelectedContact = true;
    this.currentSelectedContactAvatar = contactAvatarProvider.avatar;

    if(this.isMobile){
      this.mobileActiveTab = this.textchatTab;
      this.unsetRightRowHeight();
      this.setLeftRowHeight();
      this.hideContacts();
      this.showTextChat();
    }
  }

  private detectIsMobile():void{
    this.isMobile = WindowUtil.isMobile();

    if(this.isMobile){

      this.onActiveTabChanged();
      WindowUtil.onResize();
    }
    else{
      this.onCameDesktop();

      this.showContacts();
      this.showTextChat();
      WindowUtil.onResize();
    }
  }

  private createLeftRowCss():void{
    this.leftRowClass = [this.leftRowBaseClass];
  }
  private createRightRowCss():void{
    this.rightRowClass = [this.rightRowBaseClass];
  }

  private onChatSelected():void{
    this.mobileActiveTab = this.textchatTab;
    this.onActiveTabChanged();
  }
  private onContactSelected():void{
    this.mobileActiveTab = this.contactsTab;
    this.onActiveTabChanged();
  }
  private onInvitationsSelected():void{
    this.mobileActiveTab = this.invitationsTab;
    this.onActiveTabChanged();
  }

  private onActiveTabChanged():void{
    switch(this.mobileActiveTab){
      case this.textchatTab:
          this.onTextChatTabSelected();
        break;
      case this.contactsTab:
      case this.invitationsTab:
          this.onContactsTabSelected();
        break;
    }
  }

  private onTextChatTabSelected():void{
    if(this.isMobile && this.hasSelectedContact){
      this.unsetRightRowHeight();
      this.setLeftRowHeight();
      this.hideContacts();
      this.showTextChat();
    }
  }
  private onContactsTabSelected():void{
    if(this.isMobile){
      this.unsetLeftRowHeight();
      this.setRightRowHeight();
      this.hideTextChat();
      this.showContacts();
    }
  }

  private showTextChat():void{
    this.unsetRightRowHeight();
    if(this.textchat){
      this.textchat.show();
    }
  }
  
  private hideTextChat():void{
    if(this.textchat){
      this.textchat.hide();
    }
  }

  private showContacts():void{
    if(this.contacts){
      this.contacts.show();
    }
  }
  private hideContacts():void{
    if(this.contacts){
      this.contacts.hide();
    }
  }

  /*
   Для показа текстового чата в моб нужно, чтобы
   .appContentRowRight -> height:unset

   Для показа контактов в моб нужно, чтобы
   .appContentRowLeft -> height:unset
   -----------------------
   */
  
  private unsetLeftRowHeight():void{
    this.createLeftRowCss();
    this.leftRowClass.push(this.heightUnsetClass);
  }

  private unsetRightRowHeight():void{
    this.createRightRowCss();
    this.rightRowClass.push(this.heightUnsetClass);
  }

  private setLeftRowHeight():void{
    this.createLeftRowCss();
  }

  private setRightRowHeight():void{
    this.createRightRowCss();
  }

  private onCameDesktop():void{
    this.mobileMenuEnabled = false;

    if(this.isMobile){
      this.isMobile = false;
      this.setLeftRowHeight();
      this.setRightRowHeight();
    }
  }

  private onCameMobile():void{
    this.mobileMenuEnabled = true;
    if(!this.isMobile){
      this.isMobile = true;

      switch(this.mobileActiveTab){
        case this.contactsTab:
          this.setRightRowHeight();
          this.unsetLeftRowHeight();
          this.hideTextChat();
          this.showContacts();
          break;
        case this.textchatTab:
          this.unsetRightRowHeight();
          this.setLeftRowHeight();
          this.hideContacts();
          this.showTextChat();
          break;
      }
    }
  }

  private onRemoteVideoCameFullScreen():void {
    this.remoteVideoFullscreen = true;
  }

  private onRemoteVideoNormalScreen():void {
    this.remoteVideoFullscreen = false;
  }

  private initInfoDisplay():void{
    InfoDisplay.getInstance().setDialogService(this.dialogService);
  }

  private onConnectionCreated(serverVersion:string):void{
    this.serverVersion = serverVersion;
  }
  private onSocketTransportChanged(transport:string):void{
    this.socketTransport = transport;
  }

  protected getClassName():string{
    return "AppComponent";
  }
}
