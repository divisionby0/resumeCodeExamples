import {IUserMedia} from "./media/IUserMedia";
import {InfoDisplay} from "../info/InfoDisplay";
import {InfoType} from "../info/InfoType";
import {LadiesMediaLibraryService} from "./LadiesMediaLibraryService";
import {ISelectedMediaProvider} from "./ISelectedMediaProvider";
export var BuyMediaConfirmable = function() {
    
    return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        
        descriptor.value = function( ... args: any[]) {
            const media:IUserMedia = args[0].media;
            
            if(media.isBought()){
                return null;
            }
            
            const selectedMediaProvider:ISelectedMediaProvider = args[0].service;

            console.log("media:", media);

            selectedMediaProvider.setSelectedMedia(media);

            // show confirm
            InfoDisplay.getInstance().confirm(InfoType.BUY_MEDIA_CONFIRM, [media.getPreview()], "Buy lady's video for "+media.getCost()+" coin(s) ?", ()=>{
                    // negative
                    return null;
                },
                ()=>{
                    // positive
                    console.log("positive");
                    const result = original.apply(this, args);
                    return result;
                });
        };

        return descriptor;
    };
};