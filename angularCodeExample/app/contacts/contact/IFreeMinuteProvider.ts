import {Subject} from "rxjs/index";
export interface IFreeMinuteProvider {
    hasFreeMinute:boolean;
    setHasFreeMinuteTextChatPayment(value:boolean):void;
    isFreeMinuteTextChatPaymentAvailable():boolean;
    getFreeMinuteTextChatPaymentListener():Subject<boolean>;
}