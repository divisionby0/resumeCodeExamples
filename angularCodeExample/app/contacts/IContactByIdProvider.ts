import {Contact} from "./contact/Contact";
export interface IContactByIdProvider {
    getContactById(id:string): Contact;
}