import {Contact} from "../contacts/contact/Contact";
import {InfoDisplay} from "../info/InfoDisplay";
import {InfoType} from "../info/InfoType";
export var RemoveContactConfirmable = function(){
    return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = function( ... args: any[]) {

            var contact:Contact = args[0]; // get decorated function parameter

            InfoDisplay.getInstance().confirm(InfoType.REMOVE_CONTACT_CONFIRM, [contact.getName() + " / " + contact.getId()], "Remove contact confirmation", ()=>{
                    return null;
                },
                ()=>{
                    const result = original.apply(this, args);
                    return result;
                }
            );
        };

        return descriptor;
    };
};
