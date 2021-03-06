import {KeyMapIterator} from "./iterators/KeyMapIterator";
export class KeyMap<T> {
    private id:string = "newKeyMap";
    private items: { [key: string]: T };
    private keys:string[] = new Array();

    constructor(id:string) {
        if(id){
            this.id = id;
        }
        this.items = {};
    }

    private removeKey(key:string):void{
        var index = this.keys.indexOf(key);
        this.keys.splice(index, 1);
    }

    add(key: string, value: T): void {
        this.items[key] = value;
        this.keys.push(key);
    }

    remove(key: string): void {
        delete this.items[key];

        // remove key
        this.removeKey(key);
    }

    update(key: string, newValue:T): void {
        var value:any = this.get(key);
        if(value!=undefined && value!=null){
            this.items[key] = newValue;
        }
        else{
            console.error('Map error. No such element by key '+key);
        }
    }

    clear():void{
        this.keys = new Array();
        this.items = {};
    }

    has(key: string): boolean {
        return key in this.items;
    }

    get(key: string): T {
        return this.items[key];
    }

    getKeys():string[]{
        return this.keys;
    }

    size(): number {
        return this.keys.length;
    }
    getIterator():KeyMapIterator{
        return new KeyMapIterator(this);
    }
    setId(id:string):void{
        this.id = id;
    }
    getId():string{
        return this.id;
    }
}
