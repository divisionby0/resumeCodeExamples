import {KeyMap} from "../KeyMap";
export class KeyMapIterator{
    private collection:KeyMap<any>;

    private counter:number = -1;
    private keys:string[];

    constructor(_collection:KeyMap<any>){
        this.collection = _collection;
        this.keys = this.collection.getKeys();
    }

    hasNext():boolean{
        var nextIndex:number = this.counter+1;
        if(nextIndex < this.keys.length){
            return true;
        }
        else{
            return false;
        }
    }

    next():any{
        this.counter+=1;
        var key:string = this.keys[this.counter];
        return this.collection.get(key);
    }
    size():number{
        return this.keys.length;
    }
}
