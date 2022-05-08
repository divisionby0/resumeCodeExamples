import {Contact} from "./contact/Contact";
import {ISelectedContactProvider} from "./ISelectedContactProvider";
export class GlobalSelectedContactProvider implements ISelectedContactProvider{
    private static instance: GlobalSelectedContactProvider;

    public static getInstance(): GlobalSelectedContactProvider {
        if (!GlobalSelectedContactProvider.instance) {
            GlobalSelectedContactProvider.instance = new GlobalSelectedContactProvider();
        }

        return GlobalSelectedContactProvider.instance;
    }

    private constructor() {}
    
    private selectedContact:Contact;
    private contactIdToSelect:string = "-1";
    
    public getSelectedContact():Contact{
        return this.selectedContact;
    }
    public setSelectedContact(contact:Contact):void{
        this.selectedContact = contact;
    }

    public setContactIdToSelect(contactIdToSelect:string):void{
        this.contactIdToSelect = contactIdToSelect;
    }
    public isContactChangeIntent():boolean{
        if(!this.selectedContact){
            return true;
        }
        else{
            return parseInt(this.selectedContact.getId())!=parseInt(this.contactIdToSelect);
        }
    }
}