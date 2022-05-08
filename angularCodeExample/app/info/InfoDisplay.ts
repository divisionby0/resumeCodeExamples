import {InfoTextFactory} from "./InfoTextFactory";
import {InfoType} from "./InfoType";
import {EventBus} from "../lib/events/EventBus";
import {AppEvent} from "../AppEvent";
import {DialogService} from "../modal/dialog.service";
import {DialogType} from "../modal/dialog/DialogType";
import {DialogContentType} from "../modal/dialog/DialogContentType";
export class InfoDisplay {

    private dialogService:DialogService;
    private static instance: InfoDisplay;

    private constructor() {}

    public static getInstance(): InfoDisplay {
        if (!InfoDisplay.instance) {
            InfoDisplay.instance = new InfoDisplay();
        }

        return InfoDisplay.instance;
    }

    public hide():void{
        this.dialogService.hide();
    }
    
    public setDialogService(dialogService:DialogService):void{
        this.dialogService = dialogService;
    }

    public show(dialogType:string, infoType:number, contentType:string, errorRestData:any[], headerText:string, negativeCallback?:Function, positiveCallback?:Function):void{
        var currentInfoText:string = InfoTextFactory.getInstance().getByInfoType(infoType, errorRestData);
        this.dialogService.show(headerText, currentInfoText, contentType, dialogType, negativeCallback, positiveCallback);
    }
    
    public confirm(infoType:number, restData:any[], headerText:string, negativeCallback?:Function, positiveCallback?:Function):any{
        if(infoType == InfoType.BUY_MEDIA_CONFIRM){
            this.dialogService.show(headerText, restData[0], DialogContentType.PURCHASE_MEDIA, DialogType.YES_NO, negativeCallback, positiveCallback);
        }
        else{
            var currentConfirmText:string = InfoTextFactory.getInstance().getByInfoType(infoType, restData);
            this.dialogService.show(headerText, currentConfirmText, DialogContentType.TEXT, DialogType.YES_NO, negativeCallback, positiveCallback);
        }
    }


    private static log(value:any, ...rest):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:"InfoDisplay", value:value, rest:rest});
    }
}