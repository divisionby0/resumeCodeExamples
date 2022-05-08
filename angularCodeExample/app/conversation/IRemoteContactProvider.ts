import {Contact} from "../contacts/contact/Contact";
import {StartMediaSubscriptionResult} from "../streaming/client/StartMediaSubscriptionResult";
import {Subject} from "rxjs/index";
export interface IRemoteContactProvider{
    getRemoteContact():Contact;
    getStartVideoSubscriptionResultListener():Subject<StartMediaSubscriptionResult>;

    onSubscribeRemoteAudioRequest(remoteContact:Contact):void;
    onUnsubscribeRemoteAudioRequest():void;
    
    onSubscribeRemoteVideoRequest(remoteContact:Contact):void;
    onUnsubscribeRemoteVideoRequest():void;
    
    addToFavourites():void;
    
}