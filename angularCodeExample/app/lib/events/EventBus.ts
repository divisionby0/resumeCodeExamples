import {ListIterator} from "../collections/iterators/ListIterator";
import {KeyMap} from "../collections/KeyMap";
import {IndexList} from "../collections/IndexList";
export class EventBus{
    private static listeners:KeyMap<any> = new KeyMap('listeners');

    // add event listener
    public static addEventListener(type:string, callback:any):void{
        var typeExists:boolean = this.listeners.has(type);

        if(!typeExists){
            this.createType(type);
        }

        var typeListeners:IndexList<any> = this.getTypeListeners(type);
        this.addTypeListener(callback, typeListeners);
    }

    // remove event listener
    public static removeEventListener(type:string, callback:any):void{
        var typeExists:boolean = this.listeners.has(type);
        if(!typeExists){
            return;
        }
        var typeListeners:IndexList<any> = this.getTypeListeners(type);
        this.removeTypeListeners(callback, typeListeners);
    }

    public static dispatchEvent(type:string, eventData:any):void{
        var typeExists:boolean = this.listeners.has(type);
        if(!typeExists){
            return;
        }
        var typeListeners:IndexList<any> = this.getTypeListeners(type);
        this.executeListenersCallback(typeListeners, eventData);
    }

    private static executeListenersCallback(typeListeners:IndexList<any>, eventData:any):void{
        var iterator:ListIterator = typeListeners.getIterator();
        while(iterator.hasNext()){
            var listenerCallback = iterator.next();
            listenerCallback.call(this, eventData);
        }
    }

    private static getTypeListeners(type:string):IndexList<any>{
        return this.listeners.get(type);
    }

    private static createType(type:string):void{
        var typeListeners:IndexList<any> = this.createTypeListeners(type);
        this.listeners.add(type, typeListeners);
    }
    private static addTypeListener(callback:any, typeListeners:IndexList<any>):void{
        typeListeners.add(callback);
    }

    private static createTypeListeners(type:string):IndexList<any>{
        return new IndexList(type);
    }

    private static removeTypeListeners(callback:any, typeListeners:IndexList<any>):void{
        var iterator:ListIterator = typeListeners.getIterator();
        var currentTypeListeners:any[] = new Array();
        var index:number = -1;

        while(iterator.hasNext()){
            index++;
            var typeListener:any = iterator.next();
            if(callback.toString() == typeListener.toString()){
                currentTypeListeners.push(index);
            }
        }
        this.removeCurrentTypeListeners(currentTypeListeners, typeListeners);
        this.updateListeners(typeListeners);
    }

    private static removeCurrentTypeListeners(currentTypeListeners:any[], typeListeners:IndexList<any>):void{
        if(currentTypeListeners.length > 0){
            for(var i:number =0; i<currentTypeListeners.length; i++){
                var listenerToRemoveIndex:number = currentTypeListeners[i];
                typeListeners.remove(listenerToRemoveIndex);
            }
        }
    }

    private static updateListeners(typeListeners:IndexList<any>):void{
        if(typeListeners.size()==0){
            this.removeType(typeListeners);
        }
    }

    private static removeType(typeListeners:IndexList<any>):void{
        var type:string = typeListeners.getId();
        this.listeners.remove(type);
    }
}
