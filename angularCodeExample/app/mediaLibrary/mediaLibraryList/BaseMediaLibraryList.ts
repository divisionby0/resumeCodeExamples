import {OnInit, Component} from "@angular/core";
import {UserMedia} from "../media/UserMedia";
import {LadiesMediaLibraryService} from "../LadiesMediaLibraryService";
import {IUserMedia} from "../media/IUserMedia";
import {EventBus} from "../../lib/events/EventBus";
import {AppEvent} from "../../AppEvent";

@Component({
    selector: 'base-media-library-list',
    template: '<p>base works! </p>',
    styles: []
})
export class BaseMediaLibraryList implements OnInit{
    
    public items:UserMedia[] = [];

    constructor(protected mediaLibraryService:LadiesMediaLibraryService){
    }

    public ngOnInit():void {
        this.mediaLibraryService.getMediaAddedSubject().subscribe(media=>{
            this.items.unshift(media);
        });

        this.mediaLibraryService.getMediaRemovedSubject().subscribe(mediaId=>{
            this.items = this.items.filter(item=>{
                return item.getId()!=mediaId;
            });
        });

        this.mediaLibraryService.getUnboughtMedia();
    }

    public onBuyMedia(media:IUserMedia):void{
        this.mediaLibraryService.buyMedia(media);
    }

    private log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    protected getClassName():string{
        return "BaseMediaLibraryList";
    }
}