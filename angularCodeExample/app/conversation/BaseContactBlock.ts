import {Component, OnInit, AfterViewInit} from "@angular/core";
import {WindowUtil} from "../utils/WindowUtil";
import {Contact} from "../contacts/contact/Contact";
import {Subscription} from "rxjs/index";
import {ICollapseable} from "../avatars/person-avatar/ICollapseable";
import {InfoTextFactory} from "../info/InfoTextFactory";
import {InfoType} from "../info/InfoType";
import {MediaState} from "../contacts/contact/states/MediaState";
import {OutgoingMediaVO} from "../streaming/OutgoingMediaVO";
@Component({
    template: ''
})
export class BaseContactBlock{
    public contact:Contact;
    public cssClass:string;

    public collapsed:boolean = false;
    public videoEnabled:boolean = false;
    public audioEnabled:boolean = false;
    public avatarVisible:boolean = true;

    public collapsedInfoText:string;
    
    public controlsVisible:boolean = true;
    
    private avatarComponent:ICollapseable;

    private outAudioStateChangedListener:Subscription;
    private outVideoStateChangedListener:Subscription;

    constructor() {
        this.createWrapperCss();
    }

    public ngOnInit():void {
        
    }
    public ngAfterViewInit():void {
        WindowUtil.onResize();
    }

    public setAvatar(avatar:ICollapseable):void{
        this.avatarComponent = avatar;
    }
    public setContact(contact:Contact):void{
        // we know that contact changed !!! No need to check if it was first change or something else
        this.removePropertyChangeListeners();

        this.contact = contact;

        if(!this.collapsedInfoText){
            //var infoTextFactory:InfoTextFactory = new InfoTextFactory();
            this.collapsedInfoText = InfoTextFactory.getInstance().getByInfoType(InfoType.COLLAPSED_INFO, [this.contact.getName()]);
        }
        this.createPropertyChangeListeners();
    }
    
    private removePropertyChangeListeners():void{
        if(this.outVideoStateChangedListener){
            this.outVideoStateChangedListener.unsubscribe();
            this.outVideoStateChangedListener = null;
        }
    }

    private createPropertyChangeListeners():void{
    }

    protected collapse():void{
        if(this.avatarComponent){
            this.avatarComponent.collapse();
        }
    }
    protected expand():void{
        //console.log("expand");
        if(this.avatarComponent){
            this.avatarComponent.expand();
        }
    }
    
    protected createWrapperCss():void{
        this.cssClass = "personBlockWrapper";
    }
}