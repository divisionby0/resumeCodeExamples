import {Subject, Observable} from "rxjs/index";
export class UnreadMessagesNum {
    private totalUnreadMessages:number = 0;
    private unreadMessageNumChangedSubject:Subject<number> = new Subject();

    constructor() {
    }

    public getNumChangedListener():Observable<number>{
        return this.unreadMessageNumChangedSubject.asObservable();
    }
    public setUnreadMessagesNum(total:number):void{
        this.totalUnreadMessages = total;
        this.unreadMessageNumChangedSubject.next(this.totalUnreadMessages);
    }
    public total():number{
        return this.totalUnreadMessages;
    }
    public increment():void{
        this.totalUnreadMessages+=1;
        this.unreadMessageNumChangedSubject.next(this.totalUnreadMessages);
    }
}