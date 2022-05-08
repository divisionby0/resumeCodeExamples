import {Contact} from "../contacts/contact/Contact";
export interface ISelfDataProvider {
    getSelfContact():Contact;
}