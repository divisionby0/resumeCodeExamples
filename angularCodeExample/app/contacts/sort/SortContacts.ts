import {SortContactsPipe} from "./sortContacts.pipe";
import {AppConstants} from "../../constants/AppConstants";
import {Contact} from "../contact/Contact";
export class SortContacts {
    private timer:number;

    private collection:Contact[];
    private sorter:SortContactsPipe;

    constructor(sorter:SortContactsPipe, collection:Contact[]) {
        this.sorter = sorter;
        this.collection = collection;
        this.startTimer();
    }

    public setCollection(collection:Contact[]):void{
        this.collection = collection;
        this.stopTimer();
        this.startTimer();
    }

    public execute():void{
        this.stopTimer();
        this.sort();
        this.startTimer();
    }
    
    private startTimer():void{
        if(this.collection && this.collection.length > 1){
            var that = this;
            this.stopTimer();
            this.timer = setInterval(()=>that.sort(), AppConstants.SORT_CONTACTS_INTERVAL);
        }
    }
    private stopTimer():void{
        if(this.timer){
            clearInterval(this.timer);
        }
    }

    private sort():void{
        this.collection = this.sorter.transform(this.collection);
    }
}