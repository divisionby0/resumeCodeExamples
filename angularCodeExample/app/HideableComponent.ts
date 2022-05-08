import {LogableClass} from "./LogableClass";
export class HideableComponent extends LogableClass{

    public cssClasses:string[];
    protected baseCssClass:string;
    protected invisibleCssClass:string = "invisible";
    
    constructor() {
        super();
    }

    public hide():void{
        this.initInvisibleCss();
    }
    public show():void{
        this.initNormalCss();
    }
    
    protected initInvisibleCss():void{
        this.cssClasses = new Array(this.baseCssClass, this.invisibleCssClass);
    }

    protected initNormalCss():void{
        this.cssClasses = new Array(this.baseCssClass);
    }
}