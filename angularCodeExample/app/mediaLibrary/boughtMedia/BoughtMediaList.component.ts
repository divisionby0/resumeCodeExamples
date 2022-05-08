import {LadiesMediaLibraryService} from "../LadiesMediaLibraryService";
import {Component, OnInit} from "@angular/core";
import {EventBus} from "../../lib/events/EventBus";
import {AppEvent} from "../../AppEvent";
import {UserMedia} from "../media/UserMedia";
import {IUserMedia} from "../media/IUserMedia";

@Component({
    selector: 'bought-media-list',
    templateUrl: './BoughtMediaList.component.html',
    styleUrls: ['./BoughtMediaList.component.scss']
})
export class BoughtMediaList implements OnInit{
    
    public collection:UserMedia[] = [];
    
    constructor(private mediaLibraryService:LadiesMediaLibraryService){
    }
    
    public ngOnInit():void {
        this.mediaLibraryService.getBoughtMedia().subscribe((mediaCollection:UserMedia[])=>{
            this.collection = mediaCollection;
        });
    }

    public onRendererClicked(media:IUserMedia):void{
        this.mediaLibraryService.watchMedia(media);
    }

    private log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    private getClassName():string{
        return "BoughtMedia";
    }
}