import {Component} from "@angular/core";
import {BaseMediaLibraryList} from "../BaseMediaLibraryList";
import {WindowUtil} from "../../../utils/WindowUtil";
import {LadiesMediaLibraryService} from "../../LadiesMediaLibraryService";
import {EventBus} from "../../../lib/events/EventBus";
import {VideoViewEvent} from "../../../video/VideoViewEvent";
@Component({
    selector: 'ladies-media-library-list-mobile',
    templateUrl: './LadiesMediaLibraryListMob.component.html',
    styleUrls: ['./LadiesMediaLibraryListMob.component.scss']
})
export class LadiesMediaLibraryListMob extends BaseMediaLibraryList{

    public remoteVideoFullscreen:boolean = false;
    
    constructor(protected mediaLibraryService:LadiesMediaLibraryService){
        super(mediaLibraryService);

        EventBus.addEventListener(VideoViewEvent.ON_REMOTE_VIDEO_CAME_FULL_SCREEN, ()=>this.onRemoteVideoCameFullScreen());
        EventBus.addEventListener(VideoViewEvent.ON_REMOTE_VIDEO_CAME_NORMAL_SCREEN, ()=>this.onRemoteVideoNormalScreen());
    }

    private onRemoteVideoCameFullScreen():void{
        this.remoteVideoFullscreen = true;
    }
    private onRemoteVideoNormalScreen():void{
        this.remoteVideoFullscreen = false;
    }
    
    protected getClassName():string{
        return "LadiesMediaLibraryListMob";
    }
}