import {BuyUserMediaPayRequest} from "./BuyUserMediaPayRequest";
import {PayResponse} from "../../services/superagent/PayResponse";
import {BalanceDebugDB} from "../../models/payment/debug/BalanceDebugDB";
export class BuyUserMediaPayRequestDebug extends BuyUserMediaPayRequest{
    
    public send(coins:number):Promise<PayResponse>{
        var that = this;

        return new Promise((resolve, reject) => {
            this.log(that.senderId + " " + that.type + " -$-> " + that.receiverId);
            var response:PayResponse = BalanceDebugDB.getInstance().payCustomCoins(coins, that.senderId, that.mode, that.receiverId);

            if(response.hasError()){
                reject(response);
            }
            else{
                that.log(this.senderId + " " + this.type + " -$-> " + this.receiverId+"  Success");
                resolve(response);
            }
        });
    }
}