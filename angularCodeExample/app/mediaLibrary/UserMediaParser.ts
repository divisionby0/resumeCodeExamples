import {IContactByIdProvider} from "../contacts/IContactByIdProvider";
import {ILadiesBackendCollection} from "../backend/ILadiesBackendCollection";
import {IUserMedia} from "./media/IUserMedia";
import {AllUserMediaCollection} from "./AllUserMediaCollection";
import {UserMedia} from "./media/UserMedia";
import {EventBus} from "../lib/events/EventBus";
import {AppEvent} from "../AppEvent";
export class UserMediaParser {
    private contactByIdProvider:IContactByIdProvider;
    private ladiesProvider:ILadiesBackendCollection;
    private allUserMediaCollection:AllUserMediaCollection;

    constructor(contactByIdProvider:IContactByIdProvider, ladiesProvider:ILadiesBackendCollection, allUserMediaCollection:AllUserMediaCollection) {
        this.contactByIdProvider = contactByIdProvider;
        this.ladiesProvider = ladiesProvider;
        this.allUserMediaCollection = allUserMediaCollection;
    }
    
    public parse(mediaData:any):UserMedia{
        let mediaId:number;
        if(mediaData.mediaId){
            mediaId = mediaData.mediaId;
        }
        else if(mediaData.id){
            mediaId = mediaData.id;
        }

        let userMedia:UserMedia;

        if(this.allUserMediaCollection.has(mediaId)){
            userMedia = this.allUserMediaCollection.get(mediaId);
        }
        else{
            userMedia = new UserMedia(mediaId, mediaData.type, mediaData.userId, mediaData.previewUrl, mediaData.stillUrl, mediaData.cost, mediaData.duration, mediaData.date, this.contactByIdProvider, this.ladiesProvider);
            //this.log("parse media url = "+mediaData.url);
            userMedia.setUrl(mediaData.url);
            userMedia.setBought(mediaData.bought);
            this.allUserMediaCollection.add(userMedia);
        }
        return userMedia;
    }

    private log(value:any, ...rest:any[]):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    private getClassName():string{
        return "UserMediaParser";
    }
}