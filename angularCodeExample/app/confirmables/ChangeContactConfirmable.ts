import {Contact} from "../contacts/contact/Contact";
import {GlobalSelectedContactProvider} from "../contacts/GlobalSelectedContactProvider";
import {InfoDisplay} from "../info/InfoDisplay";
import {InfoType} from "../info/InfoType";
export var ChangeContactConfirmable = function() {

    return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = function( ... args: any[]) {
            var prevSelectedContact:Contact = GlobalSelectedContactProvider.getInstance().getSelectedContact();

            if(prevSelectedContact){
                
                var needConfirmation:boolean = GlobalSelectedContactProvider.getInstance().isContactChangeIntent() && prevSelectedContact.hasActiveTextChat();
                
                if(needConfirmation){

                    InfoDisplay.getInstance().confirm(InfoType.STOP_CONVERSATION_CONFIRM, [prevSelectedContact.getName()+" / "+prevSelectedContact.getId()], "Stop conversation confirmation", ()=>{
                            return null;
                        },
                        ()=>{
                            const result = original.apply(this, args);
                            return result;
                        });
                }
                else{
                    const result = original.apply(this, args);
                    return result;
                }
            }
            else{
                console.log("No prev selected contact");
                const result = original.apply(this, args);
                return result;
            }
        };

        return descriptor;
    };
};
