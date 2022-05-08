import {Subject} from "rxjs/index";
export interface IUserMedia {
    getId():number;
    getType():number;
    getUserId():string;
    getUrl():string;
    setUrl(url:string);
    getPreview():string;
    getStillImageUrl():string;
    getCost():number;
    getDuration():number;
    getDate():Date;
    getOwnerAvatar():string;
    setBought(value:boolean):void;
    isBought():boolean;
    getBoughtChangedSubject():Subject<boolean>;
    getOwnerAvatarReadySubject():Subject<string>;
}