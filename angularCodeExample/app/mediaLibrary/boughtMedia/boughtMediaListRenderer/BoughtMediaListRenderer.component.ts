import {Component, Input, EventEmitter, Output, Inject} from "@angular/core";
import {UserMedia} from "../../media/UserMedia";
import {DateUtils} from "../../../utils/DateUtils";
import {Subscription} from "rxjs/index";
import {FileUtils} from "../../../utils/file/FileUtils";
import {IUserMedia} from "../../media/IUserMedia";
import {LADY_AVATAR_SOURCE_ERROR_IMAGE_URL} from "../../../constants/view.constants";
import {IMediaUrlProvider} from "../../backend/IMediaUrlProvider";
import {environment} from "../../../../environments/environment";
@Component({
    selector: 'bought-media-list-renderer',
    templateUrl: './BoughtMediaListRenderer.component.html',
    styleUrls: ['./BoughtMediaListRenderer.component.scss']
})
export class BoughtMediaListRenderer{

    @Output() rendererClick:EventEmitter<IUserMedia> = new EventEmitter<IUserMedia>();
    public ownerAvatar:string;

    public dateString:string;
    public fileName:string = "myFile";
    public downloadUrl:string;
    private _data:UserMedia;

    private ownerAvatarReadySubscription:Subscription;

    get data():UserMedia {
        return this._data;
    }
    @Input() set data(value:UserMedia) {
        this._data = value;
        if(value){
            const offset:number = new Date().getTimezoneOffset();
            const ms:number = new Date(this._data.getDate()).getTime();
            
            const dateWithOffset:Date = new Date(ms);
            const dateString:string = DateUtils.parseYearMonthDay(dateWithOffset);
            const timeString:string = DateUtils.parseHourMinute(dateWithOffset);

            this.dateString = "Bought " + dateString + "<br/>at "+ timeString;

            if(!this._data.getOwnerAvatar()){
                this.ownerAvatarReadySubscription = this._data.getOwnerAvatarReadySubject().subscribe(avatar=>{
                    this.ownerAvatar = avatar;
                });
            }
            else{
                this.ownerAvatar = this._data.getOwnerAvatar();
            }
            
            this.downloadUrl = this._data.getUrl();

            if(this.downloadUrl.indexOf("undefined")!=-1 || this.downloadUrl.indexOf("hidden")!=-1){
                this.mediaUrlProvider.getMediaUrl(this._data.getId()).subscribe(data=>{
                    this.downloadUrl = environment.socketServerHttpUrl + "/" + data.userMediaUrl.url;
                });
            }
        }
    }

    public onImageSourceUndefined(event:any):void{
        var imageExists:boolean = FileUtils.imageExists(this.ownerAvatar);

        if(!imageExists){
            this.ownerAvatar = LADY_AVATAR_SOURCE_ERROR_IMAGE_URL;
        }
    }

    public onClick():void{
        this.rendererClick.emit(this._data);
    }

    constructor(@Inject("IMediaUrlProvider") private mediaUrlProvider:IMediaUrlProvider){
    }
}