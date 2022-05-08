export class Contact extends LogableClass implements IBackendContactDataProvider, IContactAvatar, IContactMediaState, IFreeMinuteProvider, IContactNameId{
  public age: number;
  public avatar: string;
  public favIcon: string;
  public from: string;
  private id: string;
  
  public mailIcon: string;
  public mailLink: string;
  private name: string;
  public profLink: string;
  public lastMessageTime: number = 0;

  public hasFreeMinute:boolean = false;
  private hasFreeMinuteSubject:Subject<boolean> = new Subject();

  public hasAudioChatPayment:boolean = false;
  public hasVideoChatPayment:boolean = false;

  private sessionId:string;
  private browserName:string;
  private timezone:number;
  private balance:ContactBalance;
  private unreadMessagesNum:UnreadMessagesNum;
  private onlineState:BaseContactState;
  private busyState:BaseContactState;
  private selectedState:SelectedState;
  
  private hasFreeMinuteTextChatPayment:boolean = false;
  private hasFreeMinuteTextChatPaymentListener:Subject<boolean> = new Subject();

  private userTypeChangedListener:Subject<string> = new Subject();
  
  private outgoingAudioVO:OutgoingMediaVO = new OutgoingMediaVO(MediaState.DISABLED);
  private outgoingAudioChangeListener:Subject<OutgoingMediaVO> = new Subject();
  
  private outgoingVideoVO:OutgoingMediaVO = new OutgoingMediaVO(MediaState.DISABLED);
  private outgoingVideoChangeListener:Subject<OutgoingMediaVO> = new Subject();
  
  private audioSubscriptionStateChangedListener:Subject<string> = new Subject();
  private videoSubscriptionStateChangedListener:Subject<string> = new Subject();

  public isTyping:boolean = false;
  
  private isHasActiveTextChat:boolean = false;
  private hasActiveTextChatListener:Subject<boolean> = new Subject();

  private userType:string = UserType.UNDEFINED;
  
  private outgoingVideoStreamName:string;
  private outgoingVideoStreamMediaServerUrl:string;

  private streamingService:IStreamingService;
  private lifetimeErrorArrivedListener:Subject<ContactLifeTimeError> = new Subject();

  private socket:ISocket;
  private backend:IBackend;
  private fingerprint:string;
  
  private participantId:string;
  private internalId:string = "Contact_"+Math.round(Math.random()*100000);

  private conversationTime:number = 0;
  private conversationDurationTimer:number;
  private conversationDurationTimerInterval:number = 1000;
  private conversationDurationChangedListener:Subject<number> = new Subject();

  private remoteAudioUnsubscribedSubject:Subject<StopMediaSubscriptionResult> = new Subject<StopMediaSubscriptionResult>();
  private remoteVideoUnsubscribedSubject:Subject<StopMediaSubscriptionResult> = new Subject<StopMediaSubscriptionResult>();

  private typingTimeout:number;
  private typingStateSubject:Subject<boolean> = new Subject<boolean>();

  private favouriteState:boolean = false;
  private favouriteStateSubject:Subject<boolean> = new Subject<boolean>();

  private receivingAudio:boolean = false;
  private receivingAudioSubject:Subject<boolean> = new Subject<boolean>();

  private receivingVideo:boolean = false;
  private receivingVideoSubject:Subject<boolean> = new Subject<boolean>();

  private selfContactOutOfMoneySubject:Subject<void> = new Subject<void>();
  private balanceReplenishedSubject:Subject<void> = new Subject<void>();
  private textchatEnabled:boolean = true;
  private textchatEnabledSubject:Subject<boolean> = new Subject<boolean>();
  private isSelf:boolean = false;

  private infoService:InfoService;

  private mediaEnabled:boolean = false;
  private mediaEnabledSubject:Subject<boolean> = new Subject<boolean>();

  private currentParticipant:Contact;

  private mood:number = -1;
  private moodChangedSubject:Subject<number> = new Subject<number>();
  
  constructor(id:string, name:string, isSelf?:boolean){
    super();
    this.id = id;
    this.name = name;
    if(isSelf!=undefined && isSelf!=null){
      this.isSelf = isSelf;
    }
    this.balance = new ContactBalance();
    this.unreadMessagesNum = new UnreadMessagesNum();

    this.onlineState = new BaseContactState();
    this.busyState = new BaseContactState();
    this.selectedState = new SelectedState();

    //EventBus.addEventListener(SocketEvent.ON_TEXT_CHAT_LADY_HAS_FREE_MINUTE, (data:any)=>this.onHasFreeMinute(data));
    if(this.isSelf){
      EventBus.addEventListener(SocketEvent.ON_UPDATE_BALANCE, (data:any)=>this.setBalance(data.balance));
      EventBus.addEventListener(SocketEvent.ON_NOT_ENOUGH_MONEY, (mode:number)=>this.onNotEnoughMoney(mode));
      EventBus.addEventListener(SocketEvent.ON_RECONNECT_ATTEMPT, ()=>this.onReconnectAttempt());
      EventBus.addEventListener(SocketEvent.ON_RECONNECTED, ()=>this.onReconnected());
    }
  }
  
  public getMood():number{
    return this.mood;
  }
  public setMood(mood:number):void{
    if(mood!=this.mood){
      //this.log("set mood "+mood);
      this.mood = mood;
      this.moodChangedSubject.next(this.mood);
    }
  }
  public getMoodChangedSubject():Subject<number>{
    return this.moodChangedSubject;
  }
  
  public getHasFreeMinuteSubject():Subject<boolean>{
    console.log(" contact "+this.id+" get has free minute subject");
    return this.hasFreeMinuteSubject;
  }
  public dispatchHasFreeMinuteChanged():void{
    this.hasFreeMinuteSubject.next(this.hasFreeMinute);
  }

  public onCurrentParticipantHasFreeMinuteChanged(currentParticipantHasFreeMinute:boolean):void{
    if(!currentParticipantHasFreeMinute && this.balance.getBalance() == 0){
      console.log("Im "+this.id+" have no money and have not free minute with "+this.currentParticipant.getId());
      console.log("disabling conversation");
      this.setTextChatEnabled(false);
      this.stopConversation();
    }
  }

  public setInfoService(infoService:InfoService):void{
    this.infoService = infoService;
  }
  
  public getRemoteAudioUnsubscribedSubject():Subject<StopMediaSubscriptionResult>{
    return this.remoteAudioUnsubscribedSubject;
  }
  public getRemoteVideoUnsubscribedSubject():Subject<StopMediaSubscriptionResult>{
    return this.remoteVideoUnsubscribedSubject;
  }
  public getTypingStateSubject():Subject<boolean>{
    return this.typingStateSubject; 
  }
  
  public destroy():void{
    //this.log("destroy this.isSelf="+this.isSelf);
    
    if(this.isSelf) {
      this.socket.disconnect();
    }

    this.setOutgoingAudioState(new OutgoingMediaVO(MediaState.DISABLED));
    this.setOutgoingVideoState(new OutgoingMediaVO(MediaState.DISABLED));

    if(this.streamingService){
      this.streamingService.destroy();
    }
  }

  public getId():string {
    return this.id;
  }
  public getName():string {
    return this.name;
  }
  
  public setSocket(socket:ISocket):void{
    this.socket = socket;
  }
  public setBackend(backend:IBackend):void{
    this.backend = backend;
  }

  public setSessionId(id:string):void {
    this.sessionId = id;
  }

  public getSessionId():string {
    return this.sessionId;
  }
  
  public setBrowserName(browserName:string):void{
    this.browserName = browserName;
  }
  public getBrowserName():string {
    return this.browserName;
  }

  public setTimezone(timezone:number):void{
    this.timezone = timezone;
  }
  public getTimezone():number {
    return this.timezone;
  }

  public onParticipantChanged(participant:Contact):void{
    this.currentParticipant = participant;
    this.updateMediaEnabledProperty();
    this.updateTextChatEnabledProperty();
  }

  private updateMediaEnabledProperty():void{
    if(this.balance.getBalance() == 0){
      this.log("i have not money - media disabled");
    }
    else if(this.balance.getBalance() == 1){
      if(this.currentParticipant){
        if(this.currentParticipant.hasFreeMinute){
          this.log("I have only 1 coin AND free minute with "+this.currentParticipant.getName()+"/"+this.currentParticipant.getId()+". I can use media for 1 minute");
          this.setMediaEnabled(true);
        }
        else{
          this.log("I have only 1 coin but NOT have free minute with "+this.currentParticipant.getName()+"/"+this.currentParticipant.getId()+". Media disabled");
          this.setMediaEnabled(false);
        }
      }
      else{
        this.setMediaEnabled(false);
      }
    }
    else{
      this.setMediaEnabled(true);
    }
  }
  private updateTextChatEnabledProperty():void{
    if(this.balance.getBalance() == 0){
      if(this.currentParticipant){
        this.setTextChatEnabled(this.currentParticipant.hasFreeMinute);
      }
      else{
        this.setTextChatEnabled(false);
      }
    }
    else{
      this.setTextChatEnabled(true);
    }
  }

  public setMediaEnabled(value:boolean):void{
    //this.log("setMediaEnabled "+value);
    this.mediaEnabled = value;
    if(this.currentParticipant){
      this.currentParticipant.setMediaEnabled(value);
    }
    this.mediaEnabledSubject.next(this.mediaEnabled);
  }
  public getMediaEnabled():boolean{
    return this.mediaEnabled;
  }
  public getMediaEnabledSubject():Subject<boolean>{
    return this.mediaEnabledSubject;
  }

  private setTextChatEnabled(value:boolean):void{
    this.textchatEnabled = value;
    //this.log("setTextChatEnabled to "+this.textchatEnabled);
    this.textchatEnabledSubject.next(this.textchatEnabled);
  }
  public getTextChatEnabled():boolean{
    return this.textchatEnabled;
  }
  public getTextChatEnabledSubject():Subject<boolean>{
    return this.textchatEnabledSubject;
  }

  public getFavouriteState():boolean{
    return this.favouriteState;
  }
  public setFavouriteState(state:boolean):void{
    this.favouriteState = state;
    this.favouriteStateSubject.next(this.favouriteState);
  }
  public gerFavouriteStateSubject():Subject<boolean>{
    return this.favouriteStateSubject;
  }
  
  public getLifeTimeErrorListener():Subject<ContactLifeTimeError>{
    return this.lifetimeErrorArrivedListener;
  }

  public setStreamingService(streamingService:IStreamingService):void{
    //...
  }

  public setBalance(balance:number):void{
    if(isNaN(Number(balance))){
      balance = 0;
    }

    this.balance.setBalance(balance);

    if(balance == 0 && this.userType == UserType.MAN){
      this.setMediaEnabled(false);
      this.selfContactOutOfMoneySubject.next();
    }
    else if(balance == 1){
      this.updateMediaEnabledProperty();
    }
    else{
      // balance > 1
      this.updateMediaEnabledProperty();
    }
  }
  public getBalance():number{
    return this.balance.getBalance();
  }
  public decrementBalance():void{
    this.balance.decrement();
  }
  public getSelfContactOutOfMoneySubject():Subject<void>{
    return this.selfContactOutOfMoneySubject;
  }
  public onBalanceReplenished():void{
    this.setTextChatEnabled(true);
    this.balanceReplenishedSubject.next();
  }
  public getBalanceReplenishedSubject():Subject<void>{
    return this.balanceReplenishedSubject;
  }

  private onNotEnoughMoney(mode:number):void{
    this.log("on Not enough money this.currentParticipant="+this.currentParticipant);

    this.log("mode="+mode+" MediaMode.TEXT="+MediaMode.TEXT);

    if(this.currentParticipant){
      if(!this.currentParticipant.hasFreeMinute || !this.currentParticipant.isFreeMinuteTextChatPaymentAvailable()){
        this.infoService.showSpecificInfo(InfoType.NOT_ENOUGH_MONEY, "Not enough money", mode.toString());
      }
    }
    else{
      this.infoService.showSpecificInfo(InfoType.NOT_ENOUGH_MONEY, "Not enough money", mode.toString());
    }

    if(mode == MediaMode.TEXT){
      this.setTextChatEnabled(false);
      EventBus.removeEventListener(SocketEvent.ON_NOT_ENOUGH_MONEY, (mode:number)=>this.onNotEnoughMoney(mode));
    }
  }

  public getBalanceChangedListener():Observable<number>{
    return this.balance.getChangedListener();
  }

  public setParticipantId(participantId:string):void {
    if (participantId != this.participantId) {
      this.participantId = participantId;
    }
  }
  
  public getReceivingVideoSubject():Subject<boolean>{
    return this.receivingVideoSubject;
  }
  public getReceivingVideo():boolean{
    return this.receivingVideo;
  }
  public setReceivingVideo(value:boolean):void{
    this.receivingVideo = value;
    this.receivingVideoSubject.next(this.receivingVideo);
  }

  // rest methods

  protected log(value:any, ...rest):void{
    EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:this.userType +" "+ this.name+"-"+this.id+"  "+" "+this.internalId+" "+value, rest:rest});
  }

  protected getClassName():string{
    return "Contact";
  }
}
