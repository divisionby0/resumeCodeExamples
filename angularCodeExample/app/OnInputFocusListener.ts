import {EventBus} from "./lib/events/EventBus";
import {AppEvent} from "./AppEvent";
import {LogableClass} from "./LogableClass";
import {WindowUtil} from "./utils/WindowUtil";
export class OnInputFocusListener extends LogableClass{

    /*
     Fixing that address bar issue in mobile browsers once and for all
     https://ishwar-rimal.medium.com/fixing-that-address-bar-issue-in-mobile-browsers-once-and-for-all-8c283fc88e56
     */

    constructor() {
        super();
        EventBus.addEventListener(AppEvent.ON_INPUT_FOCUS_IN, ()=>this.onInputFocusIn());
        EventBus.addEventListener(AppEvent.ON_INPUT_FOCUS_OUT, ()=>this.onInputFocusOut());
    }

    private onInputFocusIn():void{
        if(WindowUtil.isMobileByBrowserName() && WindowUtil.isMobile()){
            this.log("onInputFocusIn");
            this.tryEnterFullScreen();
        }
    }

    private onInputFocusOut():void{
        this.log("onInputFocusOut");

    }

    private tryEnterFullScreen():void{
        let elem = document.documentElement;

        const that = this;
        try{
            elem.requestFullscreen({ navigationUI: "show" }).then(() => {}).catch(err => {
                that.log("An error occurred while trying to switch into full-screen mode. Error message: "+err.message+" Error name:"+err.name);
            });
        }
        catch(error){
            that.log("error enter fullscreen: error=",error);
        }
        

        setTimeout(function(){
            // This hides the address bar:
            window.scrollTo(0, 1);
        }, 100);
    }


    protected getClassName():string{
        return "OnInputFocusListener";
    }
}