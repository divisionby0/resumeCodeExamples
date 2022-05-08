@Injectable()
export class SocketService implements ISocket{
  private socket:any;
  private connected:boolean = false;
  private selfId:string;
  private sessionId:string;
  private userName:string;

  private connectionFailedSubject:Subject<void> = new Subject();

  private connectionListener:SocketConnectionListener;
  private socketDataSender:SocketSender;
  private socketListener:SocketListener;
  private socketLogSenderService:SocketLogSenderService;
  private selfOSAndBrowserInfo:ISelfOSAndBrowserInfo;

  private currentTransport:string = "ws";

  private socketFirstConnectionSubscription:Subscription;

  constructor() {
    EventBus.addEventListener(AppEvent.MANUAL_RECONNECT, ()=>this.onManualReconnect());
    EventBus.addEventListener(SocketEvent.TRANSPORT_CHANGED, (transport)=>this.onTransportChanged(transport));
  }

  public setSocketLogSender(socketLogSender:SocketLogSenderService):void{
    this.socketLogSenderService = socketLogSender;
  }

  public setSelfOSAndBrowserInfo(provider:ISelfOSAndBrowserInfo):void{
    this.selfOSAndBrowserInfo = provider;
  }
  
  public connect():void{
    const browserName:string = this.selfOSAndBrowserInfo.getSelfBrowserAndOsInfo();

    const audioPublishState:any = CurrentMediaState.getInstance().getAudioPublishState();
    const videoPublishState:any = CurrentMediaState.getInstance().getVideoPublishState();
    const subscribeState:any = CurrentMediaState.getInstance().getSubscribeState();

    const opts:any = this.getOptions(this.selfId, this.sessionId, browserName, audioPublishState, videoPublishState, subscribeState);
    const socketUrl:string = environment.socketUrl;

    this.log("opts:",opts);
    this.log("SOCKET_SERVER_URL:"+socketUrl);

    try{
      this.socket = (io as any)(socketUrl, opts);
    }
    catch(error){
      this.log("error create socket ",error);
      console.error("error create socket ",error);
    }

    if(this.socket!=undefined && this.socket!=null){
      this.connectionListener = new SocketConnectionListener(this.socket);
      this.socketDataSender = new SocketSender(this.socket);
      this.socketLogSenderService.setSocket(this.socket);
      
      this.socketListener = new SocketListener(this.socket);

      this.connectionListener.getEventNamesReceivedSubject().subscribe(()=>{
        this.socketListener.createClientListeners();
      });
      
      this.socketFirstConnectionSubscription = this.connectionListener.getConnectedSubject().subscribe(()=>{
        this.log("CONNECTED TO SOCKED");
        this.socketDataSender.sendUserName(this.userName);

        EventBus.dispatchEvent(SocketEvent.SOCKET_SERVICE_INIT_COMPLETE, null);
        EventBus.dispatchEvent(SocketEvent.ON_SOCKET_CONNECTED, this.socket);
        this.socketFirstConnectionSubscription.unsubscribe();
      });

      this.connectionListener.getConnectionFailedSubject().subscribe(()=>{
        this.connectionFailedSubject.next();
      });

      this.log("socket created");
    }
    else{
      console.error("socket creation error");
    }
  }

  public getConnectionFailedSubject():Subject<void> {
    return this.connectionFailedSubject;
  }
  
  public setSelfId(id:string):void {
    this.log("set self id id="+id);
    this.selfId = id;
  }
  public setSessionId(sessionId:string):void{
    this.sessionId = sessionId;
  }
  public setUserName(userName:string):void {
    this.userName = userName;
  }

  public disconnect():void {
    const data:any = {userId:this.selfId};
    this.log("sending FORCE DISCONNECT data=",data);
    this.socket.emit("...", data);
    this.socket.disconnect();
  }

  public isConnected():boolean {
    return undefined;
  }

  public getSocketId():string {
    return undefined;
  }

  public sendPublishAudioState(data:any):void {
  }

  public sendPublishVideoState(data:any):void {
  }

  public sendSubscribeState(data:any):void {
  }

  public sendAllStates(data:any):void {
    this.socketDataSender.sendAllStates(data);
  }

  public sendPublishVideoPossiblyFrozen():void {
  }

  public sendPublishVideoFrozen():void {
  }

  public endChat(toUserId:string, fromUserId:string):void {
    this.socketDataSender.endChat(toUserId, fromUserId);
  }

  public sendRemoveContact(userId:string):void {
    this.socketDataSender.sendRemoveContact(userId);
  }

  public sendUnbanContact(userId:string):Observable<any> {
    return this.socketDataSender.sendUnbanContact(userId);
  }
  public getBannedCollection():Observable<string[]>{
    return this.socketDataSender.getBannedCollection(this.selfId);
  }

  public canStartPublishVideo():Observable<boolean> {

    return Observable.create(observer=>{

      const data:any = {socketId:this.socket.id};
      this.log("sending SocketClientEventNames.CAN_PUBLISH_VIDEO with data:",data);

      this.socket.emit(SocketClientEventNames.CAN_PUBLISH_VIDEO, data);

      this.socket.on(SocketClientEventNames.CAN_PUBLISH_VIDEO_RESPONSE, (response:boolean)=>{;
        this.socket.removeAllListeners(SocketClientEventNames.CAN_PUBLISH_VIDEO_RESPONSE);
        observer.next(response)
      });
    });
  }

  public startPublishVideo(data:any):Observable<any> {
    //...
  }
  
  public unpublishVideo():Observable<any> {
    //...
  }

  public sendPrivateMessage(message:any, senderId:string):Promise<any> {
    return this.socketDataSender.sendPrivateMessage(message, senderId);
  }

  public onCloseInvitation(senderId:string):Observable<HttpResponse<string>>{
    return undefined;
  }
  public onBlockInvitations(senderId:string):Observable<HttpResponse<string>>{
    return undefined;
  }

  public canStartPublishAudio(): Observable<boolean>{
    //...
  }
  
  public startPublishAudio(data:any):Observable<any> {
    return Observable.create(observer=>{

      this.log("sending SocketClientEventNames.START_PUBLISH_AUDIO with data:",data);

      this.socket.emit(SocketClientEventNames.START_PUBLISH_AUDIO, data);

      this.socket.on(SocketClientEventNames.START_PUBLISH_AUDIO_RESPONSE, (response:any)=>{
        this.socket.removeAllListeners(SocketClientEventNames.START_PUBLISH_AUDIO_RESPONSE);
        observer.next(response);
      });
    });
  }


  public unpublishAudio(): Observable<any>{
    //...
  }

  public stopVideoStream():void {
  }

  public getLadyVideoStateCollection():void {
  }

  public subscribeAudio(broadcasterId:string):Observable<StartMediaSubscriptionResult> {
    //...
  }

  public unsubscribeAudio():Observable<StopMediaSubscriptionResult> {
    return this.socketDataSender.unsubscribeAudio();
  }

  public subscribeVideo(broadcasterId:string):Observable<StartMediaSubscriptionResult> {
    //...
  }
  
  private onTransportChanged(transport:string):void{
    this.currentTransport = transport;
  }

  private log(value:any, ...rest:any[]):void{
    EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:"["+this.currentTransport+"] "+ value, rest:rest});
  }

  private getClassName():string{
    return "SocketService";
  }
}
