import {InfoType} from "./InfoType";
import {EventBus} from "../lib/events/EventBus";
import {
    OS_AND_BROWSER_COMPATIBILITY_ABOUT_PAGE_URL, VERSION_MISMATCH_PAGE_URL,
    BAN_UNBAN_PAGE_URL
} from "../constants/view.constants";
import {AppEvent} from "../AppEvent";
import {KeyMap} from "../lib/collections/KeyMap";
export class InfoTextFactory {

    private static instance: InfoTextFactory;

    public static getInstance(): InfoTextFactory {
        if (!InfoTextFactory.instance) {
            InfoTextFactory.instance = new InfoTextFactory();
        }

        return InfoTextFactory.instance;
    }

    private constructor() {}

    private paymentModes:KeyMap<string> = new KeyMap<string>("paymentModes");
    
    public init():void{
        this.paymentModes.add("1", "text chat");
        this.paymentModes.add("2", "audio chat");
        this.paymentModes.add("4", "video chat");
    }
    
    public getByInfoType(type:number, restData:string[]):string{
        var infoString:string;
        switch(type){
            case InfoType.OS_TOO_OLD:
                this.log("restData:",restData);
                infoString = this.osTooOldText;
                infoString = infoString.replace(/%os%/,restData[0]);
                infoString = infoString.replace(/%helpPageLink%/g, OS_AND_BROWSER_COMPATIBILITY_ABOUT_PAGE_URL);
                break;
            case InfoType.MEDIA_NOT_ALLOWED:
                infoString = this.mediaNotAllowed;
                infoString = infoString.replace(/%helpPageLink%/g, OS_AND_BROWSER_COMPATIBILITY_ABOUT_PAGE_URL);
                break;
            case InfoType.MEDIA_SERVER_ERROR:
                infoString = this.mediaServerError;
                break;
            case InfoType.MEDIA_STREAM_EMERGENCY_STOPPED:
                infoString = this.mediaStreamEmergencyStopped;
                break;
            case InfoType.DEVICE_MISMATCH:
                infoString = this.deviceMismatch;
                break;
            case InfoType.NOT_ENOUGH_MONEY:
                infoString = this.notEnoughMoney;
                var mode:string = restData[0];
                var modeString:string = this.paymentModes.get(mode);
                infoString = infoString.replace(/%mode%/,modeString);
                break;
            case InfoType.SERVER_IS_IN_DEBUG_MODE:
                infoString = this.serverIsInDebugMode;
                infoString = infoString.replace(/%balance%/,restData[0]);
                infoString = infoString.replace(/%payInterval%/,restData[1]);
                break;
            case InfoType.REMOTE_AUDIO_DISABLED:
                infoString = this.remoteAudioDisabled;
                break;
            case InfoType.REMOTE_VIDEO_DISABLED:
                infoString = this.remoteVideoDisabled;
                break;
            case InfoType.LOGIN_ERROR:
                infoString = this.loginError;
                infoString = infoString.replace(/%error%/, restData[0]);
                break;
            case InfoType.IN_BAN_LIST:
                infoString = this.inBanListSendMessageError;
                infoString = infoString.replace(/%userId%/, restData[0]);
                break;
            case InfoType.SERVER_ERROR:
                infoString = this.serveSendMessageError;
                infoString = infoString.replace(/%errorText%/, restData[0]);
                break;
            case InfoType.CLIENT_VERSION_ERROR:
                infoString = this.clientVersionError;
                infoString = infoString.replace(/%errorText%/,restData[0]);
                infoString = infoString.replace(/%helpPageLink%/g, VERSION_MISMATCH_PAGE_URL);
                break;
            case InfoType.MEDIA_STATES_ERROR:
                infoString = this.mediaStatesError;
                infoString = infoString.replace(/%helpPageLink%/g, VERSION_MISMATCH_PAGE_URL);
                break;
            case InfoType.PARTICIPANT_OUT_OF_MONEY:
                infoString = this.participantOutOfMoney;
                infoString = infoString.replace(/%participant%/, restData[0]);
                break;
            case InfoType.DISCONNECTED:
                infoString = this.disconnectedAndNeedRefreshConnection;
                break;
            case InfoType.TEXT_CHAT_EMERGENCY_STOPPED:
                infoString = this.textChatEmergencyStopped;
                infoString = infoString.replace(/%remoteId%/, restData[0]);
                infoString = infoString.replace(/%error%/, restData[1]);
                break;
            case InfoType.ERROR_AUDIO_SUBSCRIPTION:
                infoString = this.errorAudioSubscribing;
                infoString = infoString.replace(/%errorText%/, restData[0]);
                break;
            case InfoType.ERROR_VIDEO_SUBSCRIPTION:
                infoString = this.errorVideoSubscribing;
                infoString = infoString.replace(/%errorText%/, restData[0]);
                break;
        }

        return infoString;
    }

    private log(value:any, ...rest):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    private getClassName():string{
        return "InfoTextFactory";
    }
}