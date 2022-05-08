import {
    Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit, AfterContentChecked, ViewContainerRef,
    EventEmitter, Output
} from '@angular/core';
import {BaseContactBlock} from "../BaseContactBlock";
import {Contact} from "../../contacts/contact/Contact";
import {ICollapseable} from "../../avatars/person-avatar/ICollapseable";
import {IButtonEventReceiver} from "../../buttons/IButtonEventReceiver";
import {StartMediaSubscriptionResult} from "../../streaming/client/StartMediaSubscriptionResult";
import {DialogType} from "../../modal/dialog/DialogType";
import {InfoDisplay} from "../../info/InfoDisplay";
import {InfoType} from "../../info/InfoType";
import {WindowUtil} from "../../utils/WindowUtil";
import {RemoteButtonsBlockComponent} from "../../buttons/remote-buttons-block/remote-buttons-block.component";
import {MediaSubscriptionState} from "../../contacts/contact/MediaSubscriptionState";
import {StopMediaSubscriptionResult} from "../../streaming/client/StopMediaSubscriptionResult";
import {RemoteVideoComponent} from "../../video/remote-video/remote-video.component";
import {Subscription} from "rxjs/index";
import {AngularOnChangesUtil} from "../../utils/AngularOnChangesUtil";
import {OutgoingMediaVO} from "../../streaming/OutgoingMediaVO";
import {MediaState} from "../../contacts/contact/states/MediaState";
import {DialogContentType} from "../../modal/dialog/DialogContentType";

@Component({
  selector: 'app-remote-contact-block',
  templateUrl: './remote-contact-block.component.html',
  styleUrls: ['./remote-contact-block.component.scss']
})
export class RemoteContactBlockComponent extends BaseContactBlock implements OnInit, OnChanges, AfterViewInit, IButtonEventReceiver {
  @Input() contact:Contact;
  @Input() collapsed:boolean;
  @Input() fullscreen:boolean;
  @Output() addToFavourites:EventEmitter<void>;
  
  @Output() subscribeRemoteAudioEvent:EventEmitter<Contact>;
  @Output() unsubscribeRemoteAudioEvent:EventEmitter<void>;
  
  @Output() subscribeRemoteVideoEvent:EventEmitter<Contact>;
  @Output() unsubscribeRemoteVideoEvent:EventEmitter<void>;
  @Output() stopTextChat:EventEmitter<void>;
  @Output() ban:EventEmitter<void>;
  @ViewChild("avatar") avatar:ICollapseable;
  @ViewChild("buttonsBlock") buttonsBlock:RemoteButtonsBlockComponent;
  @ViewChild("video") video:RemoteVideoComponent;

  public isMobile:boolean;

  private videoStateChangedSubscription:Subscription;

  constructor(private viewRef: ViewContainerRef) {
    super();
    this.addToFavourites = new EventEmitter<void>();
    this.subscribeRemoteAudioEvent = new EventEmitter<Contact>();
    this.unsubscribeRemoteAudioEvent = new EventEmitter<void>();
    
    this.subscribeRemoteVideoEvent = new EventEmitter<Contact>();
    this.unsubscribeRemoteVideoEvent = new EventEmitter<void>();
    this.stopTextChat = new EventEmitter<void>();
    this.ban = new EventEmitter<void>();
  }

  public ngOnInit(): void {
  }

  public ngAfterViewInit():void {
    super.ngAfterViewInit();
    this.setAvatar(this.avatar);
    this.parseHostAttributes();
  }

  public ngOnChanges(changes:SimpleChanges):void {

    const contactChanged:boolean = AngularOnChangesUtil.isContactChanged(changes);
    if(contactChanged){
      if(this.videoStateChangedSubscription){
        this.videoStateChangedSubscription.unsubscribe();
        this.videoStateChangedSubscription = null;
      }

      this.videoStateChangedSubscription = this.contact.getOutgoingVideoChangedListener().subscribe((outVideoState:OutgoingMediaVO)=>this.onContactOutVideoStateChanged(outVideoState));
    }

    this.contact.getVideoSubscriptionStateChangedListener().subscribe((state:string)=>this.onVideoSubscriptionStateChanged(state));

    this.setContact(this.contact);

    if(this.collapsed){
      this.cssClass = "personBlockWrapper";
      this.collapse();
    }
    else{
      this.cssClass = "personBlockWrapperRight";
      this.expand();
    }
  }

  public onAddToFavouritesClicked():void{
    this.addToFavourites.next();
  }
  public onBanClicked():void{
    this.ban.emit();
  }
  
  public onButtonStateChanged(buttonType:string, state:string):void {
  }

  public turnOnAudio():void {
    //console.log("turn On Remote Audio");
  }
  public onStartRemoteAudio(contact:Contact):void{
    this.subscribeRemoteAudioEvent.emit(contact);
  }
  public onStopRemoteAudio():void{
    this.unsubscribeRemoteAudioEvent.emit();
  }

  public turnOffAudio():void {
  }

  public turnOnVideo(contact:Contact):void {
    // TODO remove this method
  }
  
  public onStopTextChat():void{
    this.stopTextChat.next();
  }
  
  public onStartRemoteVideo(contact:Contact):void{
    this.subscribeRemoteVideoEvent.emit(contact);
  }

  public onStopRemoteVideo():void{
    this.unsubscribeRemoteVideoEvent.emit();
  }

  // TODO избавиться от этого метода
  public turnOffVideo():void {
    this.onStopRemoteVideo();
  }

  public onStartAudioSubscriptionResult(startAudioSubscriptionResult:StartMediaSubscriptionResult):void{
    if(startAudioSubscriptionResult.isError()){
      this.buttonsBlock.resetAudioButton();

      // TODO because of prev info display could be not closed yet we need to wait some milliseconds
      setTimeout(()=>{
        InfoDisplay.getInstance().show(DialogType.OK, InfoType.SIMPLE_ERROR, DialogContentType.TEXT, [startAudioSubscriptionResult.getError()],"Error subscribing audio");
      }, 100);
    }
    else{

      var result:any = startAudioSubscriptionResult.getResult();

      if(result.success == true){
        //this.videoEnabled = true;
        this.audioEnabled = true;

        setTimeout(()=>{
          WindowUtil.onResize();
        },100);

      }
    }
  }
  public onStopAudioSubscriptionResult(result:StopMediaSubscriptionResult):void {
    if (result.isError()) {
      this.buttonsBlock.resetAudioButton();

      // TODO because of prev info display could be not closed yet we need to wait some milliseconds
      setTimeout(()=> {
        InfoDisplay.getInstance().show(DialogType.OK, InfoType.SIMPLE_ERROR, DialogContentType.TEXT, [result.getError()], "Error stop audio subscription");
      }, 100);
    }

    this.audioEnabled = false;
    if(!this.videoEnabled){
      this.avatarVisible = true;
    }

    setTimeout(()=> {
      WindowUtil.onResize();
    }, 100);
  }
  
  public onStartVideoSubscriptionResult(startVideoSubscriptionResult:StartMediaSubscriptionResult):void{
    if(startVideoSubscriptionResult.isError()){
      this.buttonsBlock.resetVideoButton();
      
      // TODO because of prev info display could be not closed yet we need to wait some milliseconds
      setTimeout(()=>{
        InfoDisplay.getInstance().show(DialogType.OK, InfoType.SIMPLE_ERROR, DialogContentType.TEXT, [startVideoSubscriptionResult.getError()],"Error subscribing video");
      }, 100);
    }
    else{
      var result:any = startVideoSubscriptionResult.getResult();

      if(result.success == true){
        this.videoEnabled = true;
        this.avatarVisible = false;
        this.controlsVisible = false;

        setTimeout(()=>{
          WindowUtil.onResize();
        },100);
      }
      else{
        console.error("Error subscribing remote video: "+startVideoSubscriptionResult.getError());
        this.buttonsBlock.resetVideoButton();
      }
    }
  }
  public onStopVideoSubscriptionResult(result:StopMediaSubscriptionResult):void {
    if (result.isError()) {
      if(this.buttonsBlock){
        this.buttonsBlock.resetVideoButton();
      }
      
      // TODO because of prev info display could be not closed yet we need to wait some milliseconds
      if(result.getError()!="notActive"){
        setTimeout(()=> {
          InfoDisplay.getInstance().show(DialogType.OK, InfoType.SIMPLE_ERROR, DialogContentType.TEXT, [result.getError()], "Error stop video subscription");
        }, 100);
      }
    }

    this.videoEnabled = false;
    this.avatarVisible = true;
    this.controlsVisible = true;

    setTimeout(()=> {
      WindowUtil.onResize();
    }, 100);
  }

  public onContactRemoved():void{
    if(this.video){
      this.video.toggleNormalScreen();
    }
  }
  
  public disableMediaButtons():void{
  }

  protected collapse():void{
    super.collapse();
    if(this.video){
      this.video.collapse();
    }
  }
  protected expand():void{
    super.expand();
    if(this.video){
      this.video.expand();
    }
  }

  private onVideoSubscriptionStateChanged(state:string):void{
    if(state == MediaSubscriptionState.STARTED){
      this.videoEnabled = true;
      this.avatarVisible = false;
    }
  }
  private onContactOutVideoStateChanged(outVideoState:OutgoingMediaVO):void{
    if(this.videoEnabled && outVideoState.getState() == MediaState.DISABLED){
      this.videoEnabled = false;
      this.avatarVisible = true;
      this.controlsVisible = true;

      setTimeout(()=>{
        WindowUtil.onResize();
      },100);
    }
  }

  private parseHostAttributes():void{
    var hostAttributes:NamedNodeMap = (this.viewRef.element as any).nativeElement.attributes;
    var mobileAttribute:Attr = hostAttributes.getNamedItem("mobile");
    this.isMobile = mobileAttribute.value === "true";
  }
  
  protected createWrapperCss():void{
    this.cssClass = "personBlockWrapperRight";
  }
}
