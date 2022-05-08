import {IUserMedia} from "./media/IUserMedia";
import {Subject} from "rxjs/index";

export interface ISelectedMediaProvider {
    setSelectedMedia(media:IUserMedia):void;
    getSelectedMedia():IUserMedia;
    getSelectedMediaChangedSubject():Subject<IUserMedia>;
}