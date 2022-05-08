import {IUserMedia} from "./media/IUserMedia";
export interface IMediaActions {
    buyMedia(media:IUserMedia):void;
    watchMedia(media:IUserMedia);
}