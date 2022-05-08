import {Subject, Observable} from "rxjs/index";
export class ContactBalance {

    private balance:number = 0;
    private balanceChangedSubject:Subject<number> = new Subject();
    
    constructor() {
    }

    public setBalance(balance:number):void{
        this.balance = balance;
        this.balanceChangedSubject.next(balance);
    }

    public getBalance():number{
        return this.balance;
    }
    public decrement():void{
        this.balance--;
        if(this.balance < 0){
            this.balance = 0;
        }
        this.balanceChangedSubject.next(this.balance);
    }
    public getChangedListener():Observable<number>{
        return this.balanceChangedSubject.asObservable();
    }
}