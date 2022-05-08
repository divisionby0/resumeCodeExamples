import {Contact} from "../contact/Contact";
export interface IContactList{
    onContactSelected(userId:string):void;
    onRemoveContactRequest(contact:Contact);
    onBanContactRequest(contact:Contact);
}
