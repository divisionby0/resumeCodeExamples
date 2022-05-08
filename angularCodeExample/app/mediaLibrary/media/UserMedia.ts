import {IUserMedia} from "./IUserMedia";
import {Subject, Subscription} from "rxjs";
import {environment} from "../../../environments/environment";
import {IContactByIdProvider} from "../../contacts/IContactByIdProvider";
import {Contact} from "../../contacts/contact/Contact";
import {ILadiesBackendCollection} from "../../backend/ILadiesBackendCollection";
import {LadiesCollectionParser} from "../../contacts/parsers/LadiesCollectionParser";
import {ContactsParseResult} from "../../contacts/parsers/ContactsParseResult";
import {EventBus} from "../../lib/events/EventBus";
import {AppEvent} from "../../AppEvent";

export class UserMedia implements IUserMedia{
    private internalId:string = "internalId_"+Math.round(Math.random()*1000000);
    private id:number;
    private type:number;
    private userId:string;
    protected url:string;
    protected previewUrl:string;
    protected stillUrl:string;
    protected cost:number;
    protected duration:number;
    protected date:Date;
    private contactByIdProvider:IContactByIdProvider;
    private ladiesProvider:ILadiesBackendCollection;
    private contact:Contact;
    private ownerAvatar:string;
    
    private ownerAvatarReadySubject:Subject<string> = new Subject<string>();

    private getOwnerSubscription:Subscription;
    
    private bought:boolean = false;
    private boughtChangesSubject:Subject<boolean> = new Subject<any>();

    constructor(id:number, type:number, userId:string, previewUrl:string, stillUrl:string, cost:number, duration:number, date:Date, contactByIdProvider:IContactByIdProvider, ladiesProvider:ILadiesBackendCollection) {
        this.id = id;
        this.type = type;
        this.userId = userId;
        
        this.stillUrl = environment.socketServerHttpUrl + "/" + stillUrl;
        this.previewUrl = environment.socketServerHttpUrl + "/" + previewUrl;
        
        this.cost = cost;
        this.duration = duration;
        this.date = date;
        this.contactByIdProvider = contactByIdProvider;
        this.ladiesProvider = ladiesProvider;

        this.getOwnerContact();
    }

    public getId():number {
        return this.id;
    }

    public getType():number {
        return this.type;
    }
    
    public getUserId():string {
        return this.userId;
    }

    public getUrl():string {
        return this.url;
    }
    public setUrl(url:string) {
        this.url = environment.socketServerHttpUrl + "/" + url;
    }
    
    public getPreview():string {
        return this.previewUrl;
    }

    public getStillImageUrl():string {
        return this.stillUrl;
    }

    public getCost():number {
        return this.cost;
    }

    public getDuration():number{
        return this.duration;
    }

    public getDate():Date {
        return this.date;
    }

    public getOwnerAvatar():string{
        return this.ownerAvatar;
    }
    public getOwnerAvatarReadySubject():Subject<string>{
        return this.ownerAvatarReadySubject;
    }
    
    public setBought(value:boolean):void{
        this.bought = value;
        this.boughtChangesSubject.next(this.bought);
    }
    
    public isBought():boolean{
        return this.bought;
    }
    public getBoughtChangedSubject():Subject<boolean>{
        return this.boughtChangesSubject;
    }

    private getOwnerContact():void{
        this.contact = this.contactByIdProvider.getContactById(this.userId);
        if(!this.contact){
            //this.log("using backend to get owner ...");

            if(this.getOwnerSubscription){
                this.getOwnerSubscription.unsubscribe();
                this.getOwnerSubscription = null;
            }

            this.getOwnerSubscription = this.ladiesProvider.getSingleContactLady(this.userId).subscribe(data=>{
                //this.log("owner backend response: ",data);

                const parser:LadiesCollectionParser = new LadiesCollectionParser(data);
                const parseResult:ContactsParseResult = parser.parse();
                this.contact = parseResult.getCollection()[0];
                this.onOwnerContactReady();
            });
        }
        else{
            this.onOwnerContactReady();
        }
    }

    private onOwnerContactReady():void{
        this.ownerAvatar = this.contact.avatar;
        this.ownerAvatarReadySubject.next(this.ownerAvatar);
    }

    private log(value:any, ...rest):void{
        EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
    }

    private getClassName():string{
        return "UserMedia";
    }
}