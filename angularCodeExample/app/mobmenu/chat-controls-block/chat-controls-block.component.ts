import {
    Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, Inject, Output,
    EventEmitter
} from '@angular/core';
import {MobMenuEvent} from "../MobMenuEvent";
import {EventBus} from "../../lib/events/EventBus";
import {ContactsService} from "../../contacts/contacts.service";
import {Contact} from "../../contacts/contact/Contact";
import {IButtonEventReceiver} from "../../buttons/IButtonEventReceiver";
import {StartMediaSubscriptionResult} from "../../streaming/client/StartMediaSubscriptionResult";
import {InfoDisplay} from "../../info/InfoDisplay";
import {DialogType} from "../../modal/dialog/DialogType";
import {InfoType} from "../../info/InfoType";
import {WindowUtil} from "../../utils/WindowUtil";
import {RemoteButtonsBlockComponent} from "../../buttons/remote-buttons-block/remote-buttons-block.component";
import {IRemoteContactProvider} from "../../conversation/IRemoteContactProvider";
import {ConversationService} from "../../conversation/conversation.service";

@Component({
  selector: 'app-chat-controls-block',
  templateUrl: './chat-controls-block.component.html',
  styleUrls: ['./chat-controls-block.component.scss']
})
export class ChatControlsBlockComponent implements OnInit, OnChanges, IButtonEventReceiver{
  @Output() onRemoteVideoStarted:EventEmitter<void> = new EventEmitter<void>();
  @ViewChild("mobMenuButtonsBlock") buttonsBlock:RemoteButtonsBlockComponent;
  @Input() selected:boolean = false;
  @Output() stopTextChat:EventEmitter<void>;
  @Output() ban:EventEmitter<void>;
  public chatButtonLabel:string = "CONVERSATION";
  public currentRemoteContactAvatar:string;
  public hasRemoteContact:boolean = false;
  public contact:Contact;

  public wrapperCssClasses:string[] = [];


  constructor(private conversationService:ConversationService) {
    this.stopTextChat = new EventEmitter<void>();
    this.ban = new EventEmitter<void>();
    this.conversationService.getStartVideoSubscriptionResultListener().subscribe((result:StartMediaSubscriptionResult)=>this.onVideoSubscriptionResult(result));
    //this.contactsService.getCurrentContactChangedListener().subscribe((contact:Contact)=>this.onContactChanged(contact));
    this.conversationService.getRemoteContactChangedListener().subscribe((remoteContact:Contact)=>this.onContactChanged(remoteContact));
  }

  public ngOnInit(): void {
  }
  
  public ngOnChanges(changes:SimpleChanges):void {
    if(this.selected){
      this.wrapperCssClasses = ["selected"];
      if(this.hasRemoteContact){
        this.wrapperCssClasses.push("expanded");
      }
    }
    else{
      if(this.hasRemoteContact){
        this.wrapperCssClasses = ["expanded"];
      }
      else{
        this.wrapperCssClasses = [];
      }
    }
  }

  public onChatSelected():void{
    if(this.conversationService.hasRemoteContact()){
      EventBus.dispatchEvent(MobMenuEvent.CHAT_SELECTED, null);
    }
  }

  onButtonStateChanged(buttonType:string, state:string):void {
  }

  public turnOnAudio():void {
    
  }

  public turnOffAudio():void {
    
  }

  public turnOnVideo():void {
  }

  public onStartRemoteAudio(contact:Contact):void{
    this.conversationService.onSubscribeRemoteAudioRequest(contact);
  }
  public onStopRemoteAudio():void{
    this.conversationService.onUnsubscribeRemoteAudioRequest();
  }

  public onStartRemoteVideo(remoteContact:Contact):void{
    this.conversationService.onSubscribeRemoteVideoRequest(remoteContact);
  }
  
  public onStopRemoteVideo():void{
    this.conversationService.onUnsubscribeRemoteVideoRequest();
  }

  public turnOffVideo():void {
    //this.contact.unsubscribeVideo();
  }

  public onStopTextChat():void{
    this.stopTextChat.next();
  }
  
  // TODO code duplication in src/app/conversation/remote-contact-block/remote-contact-block.component.ts
  public onVideoSubscriptionResult(videoSubscriptionResult:StartMediaSubscriptionResult):void{
    if(videoSubscriptionResult.isError()){
      this.buttonsBlock.resetVideoButton();
    }
    else{
      var result:any = videoSubscriptionResult.getResult();
      if(result.success == true){
        
        // TODO close mobile menu
        this.onRemoteVideoStarted.next();
        setTimeout(()=>{
          WindowUtil.onResize();
        },100);
      }
      else{
        this.buttonsBlock.resetVideoButton();
        //InfoDisplay.getInstance().show(DialogType.OK, InfoType.SIMPLE_ERROR, [videoSubscriptionResult.getError()],"Error subscribing video");
      }
    }
  }

  public onAddToFavouritesClicked():void{
    this.conversationService.addToFavourites();
  }
  public onBanClicked():void{
    this.ban.emit();
  }


  private onContactChanged(contact:Contact):void{
    //console.log(" -0-- onContactChanged contact=",contact);
    if(contact){
      this.chatButtonLabel = "SELECTED";
      this.currentRemoteContactAvatar = contact.avatar;
      this.hasRemoteContact = true;
      this.contact = contact;
    }
    else{
      this.wrapperCssClasses = [];
      this.chatButtonLabel = "CONVERSATION";
      this.hasRemoteContact = false;
      this.currentRemoteContactAvatar = null;
    }
  }
}
