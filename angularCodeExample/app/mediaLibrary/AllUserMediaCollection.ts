import {UserMedia} from "./media/UserMedia";
import {Injectable} from "@angular/core";
import {Subject} from "rxjs/index";

@Injectable({
    providedIn: 'root'
})
export class AllUserMediaCollection {
    private mediaRemovedSubject:Subject<number> = new Subject<number>();
    private mediaAddedSubject:Subject<UserMedia> = new Subject<UserMedia>();
    private collection:UserMedia[] = [];

    constructor() {
    }
    
    public getMediaRemovedSubject():Subject<number>{
        return this.mediaRemovedSubject;
    }
    public getMediaAddedSubject():Subject<UserMedia>{
        return this.mediaAddedSubject;
    }
    
    public add(media:UserMedia):void{
        this.collection.push(media);
        this.mediaAddedSubject.next(media);
    }

    public remove(id:number):void{
        this.collection = this.collection.filter(item=>{
            return item.getId()!=id;
        });
        this.mediaRemovedSubject.next(id);
    }
    
    public has(id:number):boolean{
        const filtered:UserMedia[] = this.collection.filter(media=>{
            return media.getId() == id;
        });
        return (filtered && filtered.length > 0);
    }
    
    public get(id:number):UserMedia{
        const filtered:UserMedia[] = this.collection.filter(media=>{
            return media.getId() == id;
        });
        if(filtered && filtered.length > 0){
            return filtered[0];
        }
    }
    
    public getByOwner(ownerId:string, exceptions:number[]):UserMedia[]{
        const collection:UserMedia[] = this.collection.filter(media=>{
            let include:boolean = media.getUserId() == ownerId;
            const mediaId:number = media.getId();
            
            if(exceptions.includes(mediaId)){
                include = false;
            }

            return include;
        });
        return collection;
    }
    
    public getAllExcept(exceptions:number[]):UserMedia[]{
        const collection:UserMedia[] = this.collection.filter(media=>{
            const mediaId:number = media.getId();

            if(exceptions.includes(mediaId)){
                return false;
            }
            else{
                return true;
            }
        });
        return collection;
    }
}