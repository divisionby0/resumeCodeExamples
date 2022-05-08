mport {Contact} from "./contact/Contact";
export interface ICurrentContact {
    hasCurrentContact():boolean;
    getCurrentContact(): Contact;
}