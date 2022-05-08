import {Contact} from "./contact/Contact";
import {Subject} from "rxjs/index";
export interface ISelfContact {
    getSelfContact():Contact;
    getSelfReadySubject(): Subject<Contact>;
}