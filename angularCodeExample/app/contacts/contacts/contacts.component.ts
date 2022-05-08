import {
    Component, OnInit, ViewChild, ElementRef, Inject
} from '@angular/core';
import {HideableComponent} from "../../HideableComponent";
import {IContactList} from "./IContactList";
import {IHeaderEventReceiver} from "./IHeaderEventReceiver";
import {ContactsService} from "../contacts.service";
import {EventBus} from "../../lib/events/EventBus";
import {InvitationsEvent} from "../../messages/invitations/InvitationsEvent";
import {WindowUtil} from "../../utils/WindowUtil";
import {Contact} from "../contact/Contact";
import {GlobalSelectedContactProvider} from "../GlobalSelectedContactProvider";
import {ChangeContactConfirmable} from "../../confirmables/ChangeContactConfirmable";
import {RemoveContactConfirmable} from "../../confirmables/RemoveContactConfirmable";
import {BanConfirmable} from "../../confirmables/BanConfirmable";
import {SocketEvent} from "../../socket/SocketEvent";
import {ISelfDataProvider} from "../../conversation/ISelfDataProvider";

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent extends HideableComponent implements OnInit, IHeaderEventReceiver, IContactList {

  private contactList:ElementRef;
  @ViewChild("contactList") set content(content:ElementRef){
    if(this.contactList){
      this.onContactListCameVisible();
    }
  };

  public contacts:Contact[] = new Array();
  public contactsVisible:boolean = true;
  public invitationsVisible:boolean = false;
  public latestInvitationsVisible:boolean = false;

  public selfComponent:IContactList;
  public headerEventReceiver:IHeaderEventReceiver;

  private currentSelectedUserId:string = "-1";

  constructor(private contactsService:ContactsService,
              @Inject("ISelfDataProvider") protected selfDataProvider:ISelfDataProvider) {
    super();
    this.headerEventReceiver = this;
    this.selfComponent = this;
    this.baseCssClass = "contacts";
    this.initNormalCss();

    EventBus.addEventListener(InvitationsEvent.ON_INVITE_APPROVED, (userId)=>this.onInvitationApproved(userId));
    EventBus.addEventListener(SocketEvent.ON_START_CHAT_FROM_INVITE, (data)=>this.onStartChatFromInvite(data));


    //EventBus.addEventListener(InvitationsEvent.ON_INVITATIONS_NUM_BY_EACH_PERSON_CHANGED, (collection:KeyMap<number>)=>this.onInvitationsNumByEachPersonChanged(collection));
    this.createContactsChangedListener();
    this.contactsService.getAutoSelectionContactSubject().subscribe((contactIdToAutoSelect:string)=>{
      this.log("Contact id to auto select: "+contactIdToAutoSelect);
      this.selectContact(contactIdToAutoSelect);
      this.contactsService.setContactIdToAutoSelect(null);
    });
    this.contactsService.getContactRemovedListener().subscribe((contact:Contact)=>this.onContactRemoved(contact));
  }

  public ngOnInit(): void {
  }

  public onContactSelected(userId:string):void {
    GlobalSelectedContactProvider.getInstance().setContactIdToSelect(userId);
    this.selectContact(userId);
  }

  @ChangeContactConfirmable()
  public selectContact(userId:string):void{
    var selectedContactChanged:boolean;

    if(this.currentSelectedUserId == null){
      selectedContactChanged = true;
    }
    else{
      selectedContactChanged = userId != this.currentSelectedUserId
    }

    if(selectedContactChanged){
      this.currentSelectedUserId = userId;
      var selectedContact:Contact = this.getContactById(userId);
      GlobalSelectedContactProvider.getInstance().setSelectedContact(selectedContact);
      this.contactsService.setCurrentContact(selectedContact);

      this.invitationsVisible = false;
      this.contactsVisible = true;
    }
  }

  @RemoveContactConfirmable()
  public onRemoveContactRequest(contact:Contact) {
    this.contactsService.removeContact(contact.getId());
  }

  @BanConfirmable()
  public onBanContactRequest(contact:Contact) {
    this.contactsService.removeContact(contact.getId());
  }
  
  // header events
  public contactsSelected():void{
    this.contactsVisible = true;
    this.invitationsVisible = false;
    WindowUtil.onResize();
  }
  public invitationsSelected():void{
    this.contactsVisible = false;
    this.invitationsVisible = true;
    WindowUtil.onResize();
  }

  private onInvitationApproved(fromUserId:string):void{
    var that = this;
    setTimeout(()=>{that.onContactSelected(fromUserId)}, 100);
  }

  private getContactById(userId:string):Contact | undefined{
    var i:number;
    var total:number = this.contacts.length;
    for(i=0; i<total; i++){
      var currentContact:Contact = this.contacts[i];

      if(parseInt(currentContact.getId()) == parseInt(userId)){
        return currentContact;
      }
    }
    return undefined;
  }

  private createContactsChangedListener():void{
    var that = this;
    this.contactsService.getContactsObservable().subscribe((collection:Contact[])=>that.onContactsCollectionChanged(collection));
    this.contactsService.getCurrentContactChangedListener().subscribe(()=>that.onCurrentContactChanged());
  }

  private onContactsCollectionChanged(collection:Contact[]):void{
    this.contacts = collection;
    setTimeout(()=>{
      WindowUtil.onResize();
    },300);
  }

  private onContactListCameVisible():void{
    (this.contactList as any).nativeElement.scrollTop = 0;
  }
  private onCurrentContactChanged():void{
    //(this.contactList as any).nativeElement.scrollTop = 0;
  }

  private onContactRemoved(contact:Contact):void{
    if(this.currentSelectedUserId == contact.getId()){
      //console.log("selected contact removed");
      this.currentSelectedUserId = null;
    }
  }

  private onStartChatFromInvite(data:any):void{
    this.log(" start chat from invite data=",data);
    var participantId:string = data.corrId;

    if(this.contactsService.hasContactWithId(participantId)){
      GlobalSelectedContactProvider.getInstance().setContactIdToSelect(participantId);
      this.selectContact(participantId);
    }
    else{
      this.contactsService.addContactById(participantId).then(()=>{
        GlobalSelectedContactProvider.getInstance().setContactIdToSelect(participantId);
        this.selectContact(participantId);
      });
    }
  }


  protected getClassName():string{
    return "ContactsComponent";
  }
}