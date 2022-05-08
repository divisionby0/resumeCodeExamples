import {Injectable, Inject} from '@angular/core';
import {ConversationService} from "./conversation/conversation.service";
import {Contact} from "./contacts/contact/Contact";
import {BrowserCompatibilityChecker} from "./utils/BrowserCompatibilityChecker";
import {SelfContactDataMock} from "./debug/mocks/SelfContactDataMock";
import {LogableClass} from "./LogableClass";
import {LoggingService} from "./logging/logging.service";
import {WindowUtil} from "./utils/WindowUtil";
import {ContactsService} from "./contacts/contacts.service";
import {SoundService} from "./sound/sound.service";
import {SoundSystem} from "./sound/SoundSystem";
import {InfoService} from "./info/InfoService";
import {BackendLoginOperation} from "./backend/operations/BackendLoginOperation";
import {IBackend} from "./backend/IBackend";
import {IStreamingService} from "./streaming/IStreamingService";
import {ISocket} from "./socket/ISocket";
import 'webrtc-adapter';
import {RemoteButtonsBlockService} from "./buttons/remote-buttons-block/RemoteButtonsBlockService";
import {LadiesMockCollection} from "./debug/mocks/ladies/LadiesMockCollection";
import {InsertableMediaService} from "./messages/textchat/insertables/InsertableMediaService";
import {FakeTextChatHistoryBuilder} from "./debug/messages/FakeTextChatHistoryBuilder";
import {MessagesService} from "./messages/messages.service";
import {FavIconService} from "./favIcon/FavIconService";
import {SelfButtonsBlockService} from "./buttons/self-buttons-block/SelfButtonsBlockService";
import {OutgoingMediaVO} from "./streaming/OutgoingMediaVO";
import {MediaState} from "./contacts/contact/states/MediaState";
import {EventBus} from "./lib/events/EventBus";
import {SocketEvent} from "./socket/SocketEvent";
import {InfoType} from "./info/InfoType";
import {InfoTextFactory} from "./info/InfoTextFactory";
import {IConversationTypeStartedEventReceiver} from "./messages/textchat/text-chat/IConversationTypeStartedEventReceiver";
import {SelfBalanceService} from "./badges/balanceBadge/SelfBalanceService";
import {environment} from "../environments/environment";
import {UserType} from "./contacts/UserType";
import {Settings} from "./Settings";
import {HttpResponse} from "@angular/common/http";
import {ISelfOSAndBrowserInfo} from "./ISelfOSAndBrowserInfo";
import {SocketLogSenderService} from "./socket/SocketLogSenderService";
import {AddLadyToContactsResponseParser} from "./backend/parsers/AddLadyToContactsResponseParser";
import {BackendResponse} from "./backend/BackendResponse";
import {GlobalSelectedContactProvider} from "./contacts/GlobalSelectedContactProvider";
import {AppEvent} from "./AppEvent";
import {CookieService} from "./cookie/cookie.service";
import {InfoDisplay} from "./info/InfoDisplay";
import {DialogType} from "./modal/dialog/DialogType";
import {SelfContactParser} from "./backend/parsers/SelfContactParser";
import {ISelfDataProvider} from "./conversation/ISelfDataProvider";
import {MarketingService} from "./marketing/MarketingService";
import {StatisticsService} from "./stats/StatisticsService";

@Injectable({
  providedIn: 'root'
})
export class ApplicationService extends LogableClass implements ISelfOSAndBrowserInfo{
  private selfSessionId:string;
  private selfId:string;
  private selfContact:Contact;
  private corrId:string;
  //private useNewDesignLinkParameter:number;
  //private useNewDesignCookieParameter:boolean;

  private appInitComplete:boolean = false;

  private browserName:string;
  private browserVer:string;
  private os:any;

  private isOldDesign:boolean = false;

  constructor(private loggingService:LoggingService,
              private socketLogSenderService:SocketLogSenderService,
              private infoService:InfoService,
              private conversationService:ConversationService,
              private contactsService:ContactsService,
              private soundService:SoundService,
              private remoteButtonsBlockService:RemoteButtonsBlockService,
              private selfButtonsBlockService:SelfButtonsBlockService,
              private selfBalanceService:SelfBalanceService,
              @Inject("backendService") private backendService: IBackend,
              @Inject("ISocket") private socketService: ISocket,
              @Inject("IStreamingService") private streamingService: IStreamingService,
              private insertableMediaService:InsertableMediaService,
              private messagesService:MessagesService,
              @Inject("IConversationTypeStartedEventReceiver") private conversationTypeStartedEventReceiver: IConversationTypeStartedEventReceiver,
              private favIconService:FavIconService,
              private cookieService:CookieService,
              private marketing:MarketingService,
              private StatisticsService:StatisticsService) {
    super();

    InfoTextFactory.getInstance().init();
    SoundSystem.getInstance().setSoundService(this.soundService);
    this.selfId = this.getParameterByName("login", location.href);
    this.selfSessionId = this.getParameterByName("password", location.href);
    this.corrId = this.getParameterByName("corrId", location.href);

    if(environment.production){
      Settings.getInstance().setLogToConsole(false);
    }
    
    Settings.getInstance().setCurrentUserId(this.selfId);
    
    EventBus.addEventListener(SocketEvent.SOCKET_SERVICE_INIT_COMPLETE, ()=>this.onSocketServiceReady());
    EventBus.addEventListener(SocketEvent.ON_PERMANENT_DISCONNECT, ()=>this.onSocketPermanentDisconnected());
    EventBus.addEventListener(SocketEvent.ON_CLIENT_VERSION_ERROR, (errorText)=>this.onClientVersionError(errorText));
    EventBus.addEventListener(SocketEvent.ON_BALANCE_HAS_BEEN_REPLENISHED, ()=>this.onBalanceReplenished());
    EventBus.addEventListener(AppEvent.BACKEND_USER_IS_NULL, ()=>this.onBackendUserIsNull());
    
    this.socketLogSenderService.setBackend(this.backendService);
    this.socketService.setSocketLogSender(this.socketLogSenderService);
    this.socketService.setSelfOSAndBrowserInfo(this);
    this.socketService.setSelfId(this.selfId);
    this.socketService.setSessionId(this.selfSessionId);
    this.backendService.setSelfId(this.selfId);
    this.conversationService.getRemoteContactChangedListener().subscribe((contact:Contact)=>this.onRemoteContactChanged(contact));
    //this.conversationService.getSelfContactChangedListener().subscribe((contact:Contact)=>this.onSelfContactReady(contact));
    this.conversationService.setTextChatService(this.conversationTypeStartedEventReceiver);

    const screenSize:{width:number, height:number} = WindowUtil.getScreenSize();
    this.log("Start app");
    this.detectUserDeviceAndOS();
    this.log("screen size: w="+screenSize.width+" h:"+screenSize.height);
  }
  
  public getSelfBrowserAndOsInfo():string {
    return JSON.stringify({browserName:this.browserName, browserVer:this.browserVer, os:this.os, userAgent:navigator.userAgent});
  }
  
  public init():void{
    if(!this.appInitComplete){
      this.log("App init complete !");
      this.appInitComplete = true;
      WindowUtil.onResize();
      
      this.backendService.setSessionId(this.selfSessionId);

      var loginOperation:BackendLoginOperation = new BackendLoginOperation(this.backendService);
      loginOperation.execute(this.selfId, (contact:Contact)=>this.onLoginComplete(contact), (error:string)=>this.onLoginError(error));
    }
  }

  private onLoginComplete(contact:Contact):void{
    this.onSelfContactReady(contact);
  }
  private onLoginError(error:string):void{
    this.infoService.showError(error, "Failed to login");
  }

  private onSelfContactReady(selfContact:Contact):void{
    //Settings.getInstance().setCurrentUserId(selfContact.getId());
    this.selfContact = selfContact;

    Settings.getInstance().setCurrentUserType(this.selfContact.getUserType());
    this.log("Got self user type "+this.selfContact.getUserType());

    this.socketService.setUserName(this.selfContact.getName());
    this.socketService.connect();
    this.createPayments();
  }

  private onInsertablesReady():void{
    if(environment.mockBackend == true){
      setTimeout(()=>{
        new FakeTextChatHistoryBuilder(this.contactsService, this.conversationService, this.insertableMediaService, this.socketService);
      },1400);
    }
  }

  private onRemoteContactChanged(contact:Contact):void{
    if(contact){
      //contact.setStreamingService(this.streamingService);

      if(environment.mockBackend == true){
        LadiesMockCollection.getInstance().setCurrentContact(contact);
      }
    }
  }

  private onAllMediaStatesChanged(allStates:any):void{
    this.socketService.sendAllStates(allStates);
  }
  
  private detectUserDeviceAndOS():void {
    BrowserCompatibilityChecker.getInstance().create(window.navigator.userAgent);

    this.browserVer = BrowserCompatibilityChecker.getInstance().getBrowserVersion();
    this.os = BrowserCompatibilityChecker.getInstance().getOS();

    this.randomiseBrowserName();
    const timezoneOffset:number = new Date().getTimezoneOffset();
    this.log("User connected via " + this.browserName + " " + this.browserVer + " " + JSON.stringify(this.os))+" timezone offset: "+timezoneOffset;
  }

  private randomiseBrowserName():void{
    this.browserName = BrowserCompatibilityChecker.getInstance().getBrowserName();
    if(environment.mockBackend == true){
      SelfContactDataMock.getInstance().setBrowserName(this.browserName+"_"+this.browserVer);
    }
    else{
      this.browserName = this.browserName+"_random_"+Math.round(Math.random()*100000);
    }
  }


  private onSocketServiceReady():void{
    this.conversationService.setSelfContact(this.selfContact);
    
    this.conversationService.setSocket(this.socketService);

    if(this.corrId){
      this.backendService.addLadyToContacts(this.corrId).subscribe((response:HttpResponse<string>)=>{
        this.log("add lady to contacts response: ",response);
        const parser:AddLadyToContactsResponseParser = new AddLadyToContactsResponseParser(this.selfId, response);
        const result:BackendResponse = parser.parse();
        if(result.getResult() == "OK"){
          this.log("contact from corrId "+this.corrId+" added to contacts list");
          
          this.contactsService.setContactIdToAutoSelect(this.corrId);
        }
      });
    }

    this.contactsService.init(this.selfContact, this.corrId);
    
    this.streamingService.onSelfContactReady();
    
    this.selfContact.setStreamingService(this.streamingService);

    this.insertableMediaService.getReadyListener().subscribe(()=>this.onInsertablesReady());

    this.insertableMediaService.init();

    this.socketService.getUnreadMessagesCount();
    
    // self video and audio disabled by default
    this.log("self audio and video disabled by default");
    this.selfContact.setOutgoingVideoState(new OutgoingMediaVO(MediaState.DISABLED));
    this.selfContact.setOutgoingAudioState(new OutgoingMediaVO(MediaState.DISABLED));

    const allStateData:any = this.streamingService.getAllStatesData();
    this.socketService.sendAllStates(allStateData);
  }
  private onSocketPermanentDisconnected():void{
    console.log("onSocketPermanentDisconnected");
  }
  
  private onClientVersionError(error:string):void{
    this.infoService.showSpecificInfo(InfoType.CLIENT_VERSION_ERROR, "Application version error", error);
    
    var errorText:string = InfoTextFactory.getInstance().getByInfoType(InfoType.CLIENT_VERSION_ERROR, [error]);

    // TODO disable contact selection
    this.contactsService.destroy();
    this.conversationService.destroy(errorText);
  }
  
  private onBalanceReplenished():void{
    this.log("onBalanceReplenished - getting self info again");
    
    this.infoService.showSpecificInfo(InfoType.BALANCE_HAS_BEEN_REPLENISHED, "Balance changed");
    
    this.backendService.getCurrentUserInfo(this.selfId).subscribe((response:HttpResponse<string>)=>{
      const selfContactResponseParser:SelfContactParser = new SelfContactParser(this.selfId, response);
      const selfContactResponse:BackendResponse = selfContactResponseParser.parse();
      this.log("selfContactResponse: ",selfContactResponse);
      if(selfContactResponse){
        const contact:Contact = selfContactResponse.getPayload();
        const balance:number = contact.getBalance();
        this.selfContact.setBalance(balance);
        this.selfContact.onBalanceReplenished();
        
        setTimeout(()=>{

          this.randomiseBrowserName();

          this.socketService.connect();
        },2000);
      }
    });
  }
  
  private onBackendUserIsNull():void{
    this.contactsService.destroy();
    this.conversationService.onSelfContactBackendCameOffline();
  }

  private createPayments():void{
  }

  protected getClassName():string{
    return "ApplicationService";
  }
}
