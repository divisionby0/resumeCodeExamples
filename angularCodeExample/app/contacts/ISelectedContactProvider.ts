import {Contact} from "./contact/Contact";
export interface ISelectedContactProvider {
    getSelectedContact():Contact;
    isContactChangeIntent():boolean;
}