import {Component, Output, EventEmitter, Input, Inject} from "@angular/core";
import {IUserMedia} from "../media/IUserMedia";
import {Subscription} from "rxjs/index";
import {LADY_AVATAR_SOURCE_ERROR_IMAGE_URL} from "../../constants/view.constants";
import {ISelectedMediaProvider} from "../ISelectedMediaProvider";
import {FileUtils} from "../../utils/file/FileUtils";
import {BuyMediaConfirmable} from "../BuyMediaConfirmable";
@Component({
    selector: 'base-media-library-list-renderer',
    template: '<p>base media library list renderer works! </p>',
    styles: []
})

export class BaseMediaLibraryListRenderer {
    @Output() buyMedia:EventEmitter<IUserMedia> = new EventEmitter<IUserMedia>();
    public animationUrl:string;
    public stillImageUrl:string;
    public cost:number;

    public animatedPreviewVisible:boolean = false;
    public stillPreviewVisible:boolean = true;

    private ownerAvatarReadySubscription:Subscription;

    public ownerAvatar:string;

    private _data:IUserMedia;
    get data():IUserMedia {
        return this._data;
    }

    @Input() set data(value:IUserMedia) {
        this._data = value;
        if(this._data){
            this.animationUrl = this._data.getPreview();
            this.stillImageUrl = this._data.getStillImageUrl();
            this.cost = this._data.getCost();

            if(!this._data.getOwnerAvatar()){
                this.ownerAvatarReadySubscription = this._data.getOwnerAvatarReadySubject().subscribe(avatar=>{
                    this.ownerAvatar = avatar;
                });
            }
            else{
                this.ownerAvatar = this._data.getOwnerAvatar();
            }
        }
    }

    constructor(@Inject("ISelectedMediaProvider") public mediaLibraryService:ISelectedMediaProvider){
    }

    public onImageSourceUndefined(event:any):void{
        var imageExists:boolean = FileUtils.imageExists(this.ownerAvatar);

        if(!imageExists){
            this.ownerAvatar = LADY_AVATAR_SOURCE_ERROR_IMAGE_URL;
        }
    }

    public onMouseOver():void{
        this.stillPreviewVisible = false;
        this.animatedPreviewVisible = true;
    }

    public onMouseOut():void{
        this.stillPreviewVisible = true;
        this.animatedPreviewVisible = false;
    }

    @BuyMediaConfirmable()
    public onBuyMedia(parameters:any) {
        this.buyMedia.emit(parameters.media);
    }
}