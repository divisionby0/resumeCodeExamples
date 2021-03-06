import {IndexList} from "../IndexList";
export class ListIterator{
    private collection:IndexList<any>;
    private counter:number = -1;

    constructor(_collection:IndexList<any>){
        this.collection = _collection;
    }


    hasNext():boolean{
        var nextIndex:number = this.counter+1;
        if(nextIndex < this.collection.size()){
            return true;
        }
        else{
            return false;
        }
    }

    next():any{
        this.counter+=1;
        return this.collection.get(this.counter);
    }
}
