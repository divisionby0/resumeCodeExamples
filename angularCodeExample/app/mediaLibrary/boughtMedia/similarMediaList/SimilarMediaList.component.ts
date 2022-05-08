import {Component, Input, Output, EventEmitter, OnDestroy, OnInit} from "@angular/core";
import {IUserMedia} from "../../media/IUserMedia";
import {EventBus} from "../../../lib/events/EventBus";
import {AppEvent} from "../../../AppEvent";
import {SimilarMediaService} from "../SimilarMediaService";
import {UserMedia} from "../../media/UserMedia";
import {LadiesMediaLibraryService} from "../../LadiesMediaLibraryService";
import {Subscription} from "rxjs/index";
@Component({
    selector: 'similar-media-list',
    templateUrl: './SimilarMediaList.component.html',
    styleUrls: ['./SimilarMediaList.component.scss']
})
export class SimilarMediaList implements OnDestroy{
    
    @Output() buyMedia:EventEmitter<IUserMedia> = new EventEmitter<IUserMedia>();
    public items:UserMedia[];
    private _data:IUserMedia;

    private collectionChangedSubscription:Subscription;

    get data():IUserMedia {
        return this._data;
    }

    @Input() set data(value:IUserMedia) {
        this._data = value;
        this.update();
    }

    constructor(private similarMediaService:SimilarMediaService){
        this.collectionChangedSubscription = this.similarMediaService.getCollectionChangedSubject().subscribe(()=>{
            this.update();
        });
    }
    
    public ngOnDestroy():void {
        if(this.collectionChangedSubscription){
            this.collectionChangedSubscription.unsubscribe();
            this.collectionChangedSubscription = null;
        }
    }

    private update():void{
        if(this._data){
            const ownerId:string = this._data.getUserId();
            this.items = this.similarMediaService.getSimilar(ownerId);
        }
    }

    private log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    private getClassName():string{
        return "SimilarMediaList";
    }
}