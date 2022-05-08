import {LogableClass} from "../LogableClass";
import {Injectable} from "@angular/core";
import {InfoDisplay} from "./InfoDisplay";
import {DialogType} from "../modal/dialog/DialogType";
import {InfoType} from "./InfoType";
import {InfoTextFactory} from "./InfoTextFactory";
import {DialogContentType} from "../modal/dialog/DialogContentType";

@Injectable({
    providedIn: 'root'
})
export class InfoService extends LogableClass{

    private prevInfoType:number;

    constructor() {
        super();
    }
    
    public showError(errorText:string, headerText:string):void{
        InfoDisplay.getInstance().show(DialogType.OK, InfoType.SIMPLE_ERROR, DialogContentType.TEXT, [errorText], headerText);
    }

    public showSpecificInfo(infoType:number, headerText:string, infoData?:string):void{
        if(this.prevInfoType){
            if(this.prevInfoType == InfoType.DISCONNECTED_ON_DUPLICATION){
                this.log("do not showing info because of prev info type ("+this.prevInfoType+") could not be closed");
                return;
            }

        }
        this.prevInfoType = infoType;
        if(infoData){
            InfoDisplay.getInstance().show(DialogType.OK, infoType, DialogContentType.TEXT, [infoData], headerText);
        }
        else{
            InfoDisplay.getInstance().show(DialogType.OK, infoType, DialogContentType.TEXT, null, headerText);
        }
    }
    
    public getText(infoType:number):string{
        return InfoTextFactory.getInstance().getByInfoType(infoType, null);
    }

    protected getClassName():string{
        return "InfoService";
    }
}