import {InfoDisplay} from "../info/InfoDisplay";
import {InfoType} from "../info/InfoType";
import {Contact} from "../contacts/contact/Contact";
export var BanConfirmable = function() {

    return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = function( ... args: any[]) {
            var contact:Contact = args[0];

            // show confirm
            InfoDisplay.getInstance().confirm(InfoType.BAN_CONFIRMATION, [contact.getName()+"("+contact.getId()+")"], "Ban contact confirmation", ()=>{
                    // negative
                    return null;
                },
                ()=>{
                    // positive
                    const result = original.apply(this, args);
                    return result;
                });
        };

        return descriptor;
    };
};
