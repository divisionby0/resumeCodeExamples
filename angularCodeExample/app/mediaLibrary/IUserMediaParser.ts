import {UserMedia} from "./media/UserMedia";
export interface IUserMediaParser{
    parseUserMedia(userMediaData:any):UserMedia;
}