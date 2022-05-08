import {Component, Input, OnDestroy, OnInit, Inject, ViewContainerRef} from "@angular/core";
import {LadiesMediaLibraryService} from "../LadiesMediaLibraryService";
import {ISelectedMediaProvider} from "../ISelectedMediaProvider";
import {Subscription} from "rxjs/index";
import {StringUtil} from "../../utils/StringUtil";
import {IUserMedia} from "../media/IUserMedia";
import {DateUtils} from "../../utils/DateUtils";
import {ILadiesBackendCollection} from "../../backend/ILadiesBackendCollection";
import {LadiesCollectionParser} from "../../contacts/parsers/LadiesCollectionParser";
import {ContactsParseResult} from "../../contacts/parsers/ContactsParseResult";
import {Contact} from "../../contacts/contact/Contact";
import {EventBus} from "../../lib/events/EventBus";
import {AppEvent} from "../../AppEvent";
import {FileUtils} from "../../utils/file/FileUtils";
import {LADY_AVATAR_SOURCE_ERROR_IMAGE_URL} from "../../constants/view.constants";
import {IPreviewActions} from "../IPreviewActions";
import {WindowUtil} from "../../utils/WindowUtil";
@Component({
    selector: 'media-purchase',
    templateUrl: './MediaPurchase.component.html',
    styleUrls: ['./MediaPurchase.component.scss']
})
export class MediaPurchaseComponent implements OnDestroy, OnInit{
    @Input() public previewUrl:string;
    public durationString:string = "--:--:--";
    public ownerName:string;
    public dateTime:string;
    public mediaId:number;
    public ownerAvatar:string;
    public cost:number;

    private subscription:Subscription;
    //private hostMobileAttribute:Attr;

    public containerCssClass:string = "container";
    public topBarCssClass:string = "topBar";
    public ownerContainerCssClass = "ownerContainer";
    public ownerNameCssClass = "ownerName";
    public idContainerCssClass = "idContainer";
    public costContainerCssClass = "costContainer";
    public durationContainerCssClass = "durationContainer";
    public dateContainerCssClass = "dateContainer";
    
    public isMobile:boolean = false;
    private hostMobileAttribute:Attr;

    constructor(private viewRef: ViewContainerRef,
                @Inject("IPreviewActions") private previewActions:IPreviewActions,
                @Inject("ISelectedMediaProvider") private mediaLibraryService:ISelectedMediaProvider, 
                @Inject("ILadiesBackendCollection") private ladiesBackend:ILadiesBackendCollection){

        this.subscription = this.mediaLibraryService.getSelectedMediaChangedSubject().subscribe(media=>{});

        EventBus.addEventListener(AppEvent.CAME_MOBILE, ()=>this.onCameMobile());
        EventBus.addEventListener(AppEvent.CAME_DESKTOP, ()=>this.onCameDesktop());
    }
    
    public ngOnDestroy():void {
        EventBus.removeEventListener(AppEvent.CAME_MOBILE, ()=>this.onCameMobile());
        EventBus.removeEventListener(AppEvent.CAME_DESKTOP, ()=>this.onCameDesktop());

        if(this.subscription){
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    public ngOnInit():void {
        const media:IUserMedia = this.mediaLibraryService.getSelectedMedia();
        
        if(media){
            const date:Date = new Date(media.getDate());
            const ownerId:string = media.getUserId();
            this.mediaId = media.getId();
            this.cost = media.getCost();
            this.durationString = StringUtil.toDuration(media.getDuration());
            this.dateTime = DateUtils.parseYearMonthDay(date)+" "+DateUtils.parseHourMinute(date);
            
            this.ladiesBackend.getSingleContactLady(ownerId).subscribe(response=>{
                var parser:LadiesCollectionParser = new LadiesCollectionParser(response);
                var parseResult:ContactsParseResult = parser.parse();

                if(!parseResult.hasError()){
                    var contact:Contact = parseResult.getCollection()[0];
                    this.ownerAvatar = contact.avatar;
                    this.ownerName = contact.getName();
                }
                else{
                    this.log("error getting contact from server by id "+ownerId+" error:"+response.body);
                }
            });

            this.previewActions.previewReviewed(this.mediaId);
        }

        const hostAttributes:NamedNodeMap = (this.viewRef.element as any).nativeElement.attributes;
        this.hostMobileAttribute = hostAttributes.getNamedItem("mobile");
        
        this.updateSize();
    }

    public onImageSourceUndefined(event:any):void{
        var imageExists:boolean = FileUtils.imageExists(this.ownerAvatar);

        if(!imageExists){
            this.ownerAvatar = LADY_AVATAR_SOURCE_ERROR_IMAGE_URL;
        }
    }

    private onCameMobile():void{
        this.updateSize();
    }
    private onCameDesktop():void{
        this.updateSize();
    }

    private updateSize():void{
        if(WindowUtil.isMobile() || WindowUtil.isMobileByBrowserName()){
            this.isMobile = true;
            this.ownerNameCssClass = "ownerNameMob";
            this.containerCssClass = "containerMob";
            this.topBarCssClass = "topBarMob";
            this.ownerContainerCssClass = "ownerContainerMob";
            this.idContainerCssClass = "idContainerMob";
            this.costContainerCssClass = "costContainerMob";
            this.durationContainerCssClass = "durationContainerMob";
            this.dateContainerCssClass = "dateContainerMob";
            this.hostMobileAttribute.value = 'true';
        }
        else{
            this.isMobile = false;
            this.ownerNameCssClass = "ownerName";
            this.containerCssClass = "container";
            this.topBarCssClass = "topBar";
            this.ownerContainerCssClass = "ownerContainer";
            this.idContainerCssClass = "idContainer";
            this.costContainerCssClass = "costContainer";
            this.durationContainerCssClass = "durationContainer";
            this.dateContainerCssClass = "dateContainer";
            this.hostMobileAttribute.value = 'false' +
                '' +
                '';
        }
    }

    private log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    private getClassName():string{
        return "MediaPurchaseComponent";
    }
}