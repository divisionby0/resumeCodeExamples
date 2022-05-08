import {Injectable, Inject} from "@angular/core";
import {AllUserMediaCollection} from "../AllUserMediaCollection";
import {EventBus} from "../../lib/events/EventBus";
import {AppEvent} from "../../AppEvent";
import {UserMedia} from "../media/UserMedia";
import {Subject} from "rxjs/index";
@Injectable({
    providedIn: 'root'
})
export class SimilarMediaService {
    private exceptionMediaIDs:number[] = [];

    private collectionChangedSubject:Subject<void> = new Subject<void>();
    
    constructor(private allUserMediaCollection:AllUserMediaCollection) {
        this.allUserMediaCollection.getMediaRemovedSubject().subscribe(mediaId=>{
            this.collectionChangedSubject.next();
        });
        this.allUserMediaCollection.getMediaAddedSubject().subscribe(media=>{
            this.collectionChangedSubject.next();
        });
    }
    
    public getCollectionChangedSubject():Subject<void>{
        return this.collectionChangedSubject;
    }
    
    public getSimilar(ownerId:string):UserMedia[]{
        // TODO сделать несколько способов получения похожих, а не только по id создателя
        const allMediaExceptBought:UserMedia[] = this.allUserMediaCollection.getAllExcept(this.exceptionMediaIDs);
        return allMediaExceptBought;
    }
    
    public addException(mediaId:number):void{
        if(!this.hasException(mediaId)){
            this.exceptionMediaIDs.push(mediaId);
        }
    }
    
    private hasException(id:number):boolean{
        const filtered:number[] = this.exceptionMediaIDs.filter(item=>{
            return item == id;
        });
        
        return filtered && filtered.length > 0;
    }

    private log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    private getClassName():string{
        return "SimilarMediaService";
    }
}