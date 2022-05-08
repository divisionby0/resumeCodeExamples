import {Injectable, Inject, InjectionToken} from "@angular/core";
import {MediaLibraryBackend} from "./backend/MediaLibraryBackend";
import {IUserMedia} from "./media/IUserMedia";
import {ISelfContact} from "../contacts/ISelfContact";
import {EventBus} from "../lib/events/EventBus";
import {AppEvent} from "../AppEvent";
import {Observable, Subject} from "rxjs/index";
import {UserMedia} from "./media/UserMedia";
import {InfoDisplay} from "../info/InfoDisplay";
import {DialogType} from "../modal/dialog/DialogType";
import {InfoType} from "../info/InfoType";
import {DialogContentType} from "../modal/dialog/DialogContentType";
import {Contact} from "../contacts/contact/Contact";
import {ISelectedMediaProvider} from "./ISelectedMediaProvider";
import {MediaLibrarySocketService} from "./socket/MediaLibrarySocketService";
import {IContactByIdProvider} from "../contacts/IContactByIdProvider";
import {ILadiesBackendCollection} from "../backend/ILadiesBackendCollection";
import {DialogService} from "../modal/dialog.service";
import {ISelectedBoughtMediaProvider} from "./ISelectedBoughtMediaProvider";
import {AllUserMediaCollection} from "./AllUserMediaCollection";
import {SimilarMediaService} from "./boughtMedia/SimilarMediaService";
import {IUserMediaByCodeProvider} from "./IUserMediaByCodeProvider";
import {UserMediaCodeParser} from "./UserMediaCodeParser";
import {IMediaActions} from "./IMediaActions";
import {IPreviewActions} from "./IPreviewActions";
import {ILadyUnboughtMediaProvider} from "./backend/ILadyUnboughtMediaProvider";
import {UserMediaParser} from "./UserMediaParser";
import {IUserMediaParser} from "./IUserMediaParser";
import {UserMediaUtil} from "./utils/UserMediaUtil";

@Injectable({
    providedIn: 'root'
})
export class LadiesMediaLibraryService implements ISelectedMediaProvider, ISelectedBoughtMediaProvider, IUserMediaByCodeProvider, IUserMediaParser, IMediaActions, IPreviewActions, ILadyUnboughtMediaProvider{
    private selectedMedia:IUserMedia;
    private selectedMediaChangedSubject:Subject<IUserMedia> = new Subject<IUserMedia>();
    
    private mediaCollection:UserMedia[] = [];
    private mediaAddedSubject:Subject<UserMedia> = new Subject<UserMedia>();
    private mediaRemovedSubject:Subject<number> = new Subject<number>();

    private selfContact:Contact;
    
    private mediaBoughSubject:Subject<UserMedia> = new Subject<UserMedia>();
    private selectedBoughtMedia:IUserMedia;

    private userMediaParser:UserMediaParser;
    
    constructor(@Inject("ISelfContact") private selfContactProvider:ISelfContact,
                @Inject("IContactByIdProvider") private contactByIdProvider:IContactByIdProvider,
                @Inject("ILadiesBackendCollection") private ladiesProvider:ILadiesBackendCollection,
                private mediaLibraryBackend:MediaLibraryBackend,
                private allUserMediaCollection:AllUserMediaCollection,
                private mediaLibrarySocketService:MediaLibrarySocketService,
                private similarMediaService:SimilarMediaService,
                private dialogService:DialogService) {

        this.userMediaParser = new UserMediaParser(this.contactByIdProvider, this.ladiesProvider, this.allUserMediaCollection);
        
        this.selfContactProvider.getSelfReadySubject().subscribe(selfContact=>{
            this.selfContact = selfContact;
            this.log("selfContact ready");
            this.loadUnboughtMedia();
        });

        this.mediaLibrarySocketService.getUserMediaAddedSubject().subscribe(data=>{
            const userMedia:UserMedia = this.parseSingleMedia(data);
            this.mediaCollection.push(userMedia);
            this.mediaAddedSubject.next(userMedia);
        });

        this.mediaLibrarySocketService.getUserMediaRemovedSubject().subscribe(mediaId=>{
            this.allUserMediaCollection.remove(mediaId);
            this.mediaRemovedSubject.next(mediaId);
        });
    }
    
    public getMediaAddedSubject():Subject<UserMedia>{
        return this.mediaAddedSubject;
    }
    public getMediaRemovedSubject():Subject<number>{
        return this.mediaRemovedSubject;
    }

    public parseUserMedia(userMediaData:any):UserMedia {
        return this.userMediaParser.parse(userMediaData);
    }
    
    public getMediaByCode(code:string):Observable<any>{
        this.log("getMediaByCode code="+code);
        return Observable.create(observer=>{
            
            //let idString:string = code.replace("[UserMedia=","");
            const id:number = UserMediaUtil.parseId(code);

            this.log("id="+id);

            if(!isNaN(id)){
                this.mediaLibraryBackend.getMediaById(id, this.selfContact.getId()).subscribe(data=>{
                    console.log("media by id data: ",data);
                    if(data.userMedia){
                        const media:UserMedia = this.parseSingleMedia(data.userMedia);
                        observer.next({result:"OK", media:media});
                    }
                    else{
                        observer.next({result:"ERROR", error:"media by code "+code+" not found"});
                    }
                });
            }
            else{
                this.log("media by code "+code+" not found");
                observer.next({result:"ERROR", error:"media by code "+code+" not found"});
            }
        });
    }
    
    public buyMedia(media:IUserMedia):void{
        this.log("buyMedia: ",media.getId());
        this.mediaLibraryBackend.buyMedia(media.getId(), this.selfContactProvider.getSelfContact().getId()).subscribe(response=>{
            this.log("buy media response: ",response);

            if(response.result == "OK"){
                // TODO move media to bought
                const mediaId:number = response.mediaId;

                this.similarMediaService.addException(mediaId);

                const media:UserMedia = this.getCollectionItemById(mediaId);
                this.mediaBoughSubject.next(media);
                
                this.removeCollectionItem(mediaId);
                this.mediaRemovedSubject.next(mediaId);
                
                this.selectedMedia = null;
                media.setBought(true);

                this.watchMedia(media);
                //InfoDisplay.getInstance().show(DialogType.OK, InfoType.BUY_MEDIA_COMPLETE, DialogContentType.TEXT, null, "Purchase complete");
            }
            else{
                alert(response.error);
            }
        });
    }

    public watchMedia(media:IUserMedia) {
        this.selectedBoughtMedia = media;
        this.dialogService.hide();
        this.dialogService.show("Your bought media","", DialogContentType.BOUGHT_MEDIA_VIDEO_PLAYER, DialogType.OK);
    }
    
    public getUnboughtMedia():void{
        if(this.selfContact){
           this.loadUnboughtMedia();
        }
    }
    
    public getBoughtMedia():Observable<UserMedia[]>{
        return Observable.create(observer=>{
            this.mediaLibraryBackend.getBoughtMedia(this.selfContactProvider.getSelfContact().getId()).subscribe(data=>{
                const collection:UserMedia[] = this.parseMediaCollection(data);
                const total:number = collection.length;
                let i:number;

                for(i=0; i<total; i++){
                    const currentBoughtMedia:IUserMedia = collection[i];
                    currentBoughtMedia.setBought(true);
                    this.similarMediaService.addException(currentBoughtMedia.getId());
                }
                
                observer.next(collection);
            });
        });
    }

    public setSelectedMedia(media:IUserMedia):void {
        this.selectedMedia = media;
        this.selectedMediaChangedSubject.next(this.selectedMedia);
    }
    public getSelectedMedia():IUserMedia {
        return this.selectedMedia;
    }
    public getSelectedMediaChangedSubject():Subject<IUserMedia>{
        return this.selectedMediaChangedSubject;
    }

    public getSelectedBoughtMedia():IUserMedia {
        return this.selectedBoughtMedia;
    }

    public getLadyUnboughtMedia(customerId:string, ladyId:string):Observable<any> {
        return this.mediaLibraryBackend.getLadyUnboughtMedia(customerId, ladyId);
    }

    public previewReviewed(mediaId:number):void {
        this.log("preview reviewed "+mediaId);
        this.mediaLibraryBackend.previewReviewed(mediaId, this.selfContact.getId()).subscribe(data=>{
            this.log("preview reviewed response: ",data);
        });
    }

    private loadUnboughtMedia():void{
        this.mediaLibraryBackend.getUnboughtMedia(this.selfContactProvider.getSelfContact().getId()).subscribe(data=>{
            this.mediaCollection = this.parseMediaCollection(data);
            this.log("Unbought media collection length " + this.mediaCollection.length);
            let i:number;
            const total:number = this.mediaCollection.length;
            for(i=0; i<total; i++){
                const currentUserMedia:UserMedia = this.mediaCollection[i];
                //const mediaId:number = currentUserMedia.getId();
                this.mediaAddedSubject.next(currentUserMedia);
            }
        });
    }

    private parseMediaCollection(data:any):UserMedia[]{
        const collection:UserMedia[] = [];
        if(data.result == "OK"){
            const mediaRawCollection:any[] = data.media;
            let i:number;
            const total:number = mediaRawCollection.length;
            for(i=0; i<total; i++){
                const currentMedia:any = mediaRawCollection[i];
                const userMedia:UserMedia = this.parseSingleMedia(currentMedia);
                collection.push(userMedia)
            }
            return collection;
        }
        else{
            this.log("parse bought media error: "+data.error);
            alert("Unable to get bought media list");
        }
    }

    private parseSingleMedia(mediaData:any):UserMedia{
        return this.userMediaParser.parse(mediaData);
    }

    private getCollectionItemById(id:number):UserMedia | null{
        const filtered:UserMedia[] = this.mediaCollection.filter(media=>{
            return media.getId() == id;
        });

        if(filtered && filtered.length > 0){
            return filtered[0];
        }
        else{
            return null;
        }
    }
    
    private removeCollectionItem(id:number):void{
        this.mediaCollection = this.mediaCollection.filter(media=>{
            return media.getId()!=id;
        });
    } 
    private hasCollectionItem(id:number):boolean{
        const filtered:UserMedia[] = this.mediaCollection.filter(media=>{
            return media.getId()==id;
        });
        
        return filtered && filtered.length > 0;
    } 

    private log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    private getClassName():string{
        return "LadiesMediaLibraryService";
    }
}