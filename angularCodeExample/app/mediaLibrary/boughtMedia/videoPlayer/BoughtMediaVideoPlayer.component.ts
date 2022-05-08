import {Component, Inject, OnInit} from "@angular/core";
import {ISelectedBoughtMediaProvider} from "../../ISelectedBoughtMediaProvider";
import {IUserMedia} from "../../media/IUserMedia";
import {IMediaUrlProvider} from "../../backend/IMediaUrlProvider";
import {environment} from "../../../../environments/environment";
@Component({
    selector: 'video-player',
    templateUrl: './BoughtMediaVideoPlayer.component.html',
    styleUrls: ['./BoughtMediaVideoPlayer.component.scss']
})
export class BoughtMediaVideoPlayer implements OnInit{
    public mediaUrl:string;
    public selectedMedia:IUserMedia;
    constructor(@Inject("IMediaUrlProvider") private mediaUrlProvider:IMediaUrlProvider,
                @Inject("ISelectedBoughtMediaProvider") private selectedBoughtMediaProvider:ISelectedBoughtMediaProvider){
    }
    
    public ngOnInit():void {
        this.selectedMedia = this.selectedBoughtMediaProvider.getSelectedBoughtMedia();
        this.mediaUrl = this.selectedMedia.getUrl();
        
        if(this.mediaUrl.indexOf("undefined")!=-1 || this.mediaUrl.indexOf("hidden")!=-1){
            this.mediaUrlProvider.getMediaUrl(this.selectedMedia.getId()).subscribe(data=>{
                this.mediaUrl = environment.socketServerHttpUrl + "/" + data.userMediaUrl.url;
            });
        }
    }
}