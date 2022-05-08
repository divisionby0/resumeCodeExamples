import {IContactData} from "./IContactData";
import {Contact} from "../contact/Contact";
export interface IContactListRenderer extends IContactData{
    ban(contact:Contact):void;
    remove();
}