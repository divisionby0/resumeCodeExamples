import {ILadiesBackendCollection} from "../../backend/ILadiesBackendCollection";
import {AppConstants} from "../../constants/AppConstants";
import {HttpResponse} from "@angular/common/http";
export class RefreshLadiesTimer {
    private backend:ILadiesBackendCollection;
    private responseCallback:Function;
    private selfId:string;
    private timer:number;

    constructor(backend:ILadiesBackendCollection, responseCallback:Function) {
        this.backend = backend;
        this.responseCallback = responseCallback;
        this.getLadies();
        this.start();
    }
    
    public stop():void{
        this.destroyTimer();
    }
    public start():void{
        this.destroyTimer();
        this.timer = setInterval(()=>this.getLadies(), AppConstants.CONTACTS_REFRESH_INTERVAL);
    }

    public refresh():void{
        this.getLadies();
    }
    
    private destroyTimer():void{
        if(this.timer){
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    private getLadies():void{
        this.backend.getContactsLadies().subscribe((response:HttpResponse<string>)=>this.onResponse(response));
    }

    private onResponse(response:HttpResponse<string>):void{
        this.responseCallback.call(this, response);
    }
}