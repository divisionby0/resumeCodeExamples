import * as superagent from "superagent";
import {PayRequest} from "../../services/superagent/request/PayRequest";
import {PayResponse} from "../../services/superagent/PayResponse";
import {CMD_PAY, PAY_MODE_USER_MEDIA, CMD_CUSTOM_PAY} from "../../constants/api.constants";
import {PaymentType} from "../../models/payment/PaymentType";
export class BuyUserMediaPayRequest extends PayRequest{
    
    constructor(receiverId:string, senderId:string, timezone:any, host:string, endpoint:string, appVer:string) {
        super(receiverId, senderId, PAY_MODE_USER_MEDIA, PaymentType.USER_MEDIA, timezone, host, endpoint, appVer);
    }

    public send(coins?:number):Promise<PayResponse>{

        this.log(this.senderId + " " + this.type + " -$-> " + this.receiverId+" coins: "+coins);

        var that = this;

        return new Promise((resolve, reject) => {
            const random = Math.random() * 10000;
            const date = new Date();

            /*
             final Integer userId = getIntegerParameter(request.getParameter("userid"));
             final Integer ladyId = getIntegerParameter(request.getParameter("ladyid"));
             final Integer coins = getIntegerParameter(request.getParameter("coins"));
             */

            
            that.log("pay request url "+this.host + this.endpoint+" ");
            that.log("this.senderId "+this.senderId + "this.receiverId " + this.receiverId+" coins "+coins);

            superagent
                .get(this.host + this.endpoint)
                .query({ command: CMD_CUSTOM_PAY })
                .query({ date: date.toISOString() })
                .query({ tz: this.timezone })
                .query({ userid: this.senderId })
                .query({ random: random.toString() })
                .query({ ladyid: this.receiverId })
                .query({ coins: coins })
                .query({ ver: this.appVer })
                .then((res: any) => {
                    that.log("pay for custom product response :"+res.text+" payerId:"+this.senderId);
                    const resValues = res.text.split("|");

                    if (resValues[0] === "OK") {
                        that.log(this.senderId + " " + this.type + " -$-> " + this.receiverId+"  Success");
                        const state = parseInt(resValues[1], 10);
                        const receiverId = parseInt(resValues[2], 10);
                        const balance = parseInt(resValues[3], 10);
                        var response:PayResponse = new PayResponse(receiverId, balance, null, state);
                        resolve(response);
                    } else {
                        that.log(this.senderId +' '+CMD_CUSTOM_PAY+' for '+this.receiverId+' rejection: '+ resValues[1]);
                        var response:PayResponse = new PayResponse(parseInt(this.receiverId), 0, resValues[1], null);
                        reject(response);
                    }
                })
                .catch((err: any) => {
                    this.log("Catch error err="+err);
                    var errorText:string = JSON.stringify(err);
                    var response:PayResponse = new PayResponse(parseInt(this.receiverId), 0, errorText, null);
                    reject(response);
                });
        });
    }
    
}