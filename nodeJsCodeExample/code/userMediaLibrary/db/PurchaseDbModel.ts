import {Observable} from "rxjs";
import {AppLogger} from "../../services/logging/AppLogger";
const {Sequelize, DataTypes, Op, Models, QueryTypes } = require('sequelize');
declare var require:any;
export class PurchaseDbModel {
    private model:any;
    private sequelize:any;

    constructor(sequelize:any) {
        this.sequelize = sequelize;
        this.createModel(sequelize);
    }

    private createModel(sequelize:any):void{
        this.model = sequelize.define('PurchaseModel',{
                mediaId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                customerId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                date:{
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW
                }
            },
            {
                sequelize,
                timestamps: true,
                createdAt: false,
                updatedAt: false,
                tableName: 'purchases',
                modelName: 'PurchaseModel'
            });
    }

    public create(mediaId:number, customerId:number):Observable<any>{
        const that = this;
        return Observable.create(observer=>{
            const createObject:any = {
                mediaId:mediaId,
                customerId:customerId
            };

            this.model.create(
                createObject
            ).then((data:any)=>{
                that.log("create media purchase response data="+JSON.stringify(data));
                if(data){
                    observer.next({result:"OK", date:data.date});
                }
                else{
                    that.log("create media purchase error "+data.error);
                    observer.next({result:"Error", error:data.error});
                }
            }).catch(error=>{
                that.log("create media purchase error "+error);
                observer.next({result:"Error", error:error});
            });
        });
    }

    public getTotalPurchases(mediaId:number):Observable<any>{
        return Observable.create(observer=>{
            const condition:any = {
                where: {
                    mediaId: mediaId
                }
            };

            this.model.count(condition).then(total=>{
                if(total){
                    observer.next({result:"OK", total:total});
                }
                else{
                    observer.next({result:"ERROR", error:"No total found"});
                }
            });
        });
    }
    
    public getPurchases(mediaId:number):Observable<any>{
        return Observable.create(observer=>{
            const condition:any = {
                where: {
                    mediaId: mediaId
                }
            };

            this.model.findAll(condition).then(data=>{
                if(data){
                    observer.next({result:"OK", purchases:data, mediaId:mediaId});
                }
                else{
                    observer.next({result:"ERROR", error:"No purchases found for media "+mediaId});
                }
            });
        });
    }

    public boughtMediaExists(mediaId:number):Observable<any>{
        return Observable.create(observer=>{
            const condition:any = {
                where: {
                    mediaId: mediaId
                }
            };
            this.model.findOne(condition).then(data=>{
                if(data){
                    observer.next({exists:true});
                }
                else{
                    observer.next({exists:false});
                }
            });
        });
    }

    public has(mediaId:number, customerId:number):Observable<any>{
        return Observable.create(observer=>{
            const condition:any = {
                where: {
                    mediaId: mediaId,
                    customerId:customerId
                }
            };
            this.model.findOne(condition).then(data=>{
                if(data){
                    observer.next({exists:true});
                }
                else{
                    observer.next({exists:false});
                }
            });
        });
    }

    public getMediaByCustomerId(customerId:number):Observable<any>{
        const that = this;
        return Observable.create(observer=>{
            // TODO https://sebhastian.com/sequelize-join/
            // SELECT purchases.mediaId, usermedia.date, usermedia.type, usermedia.cost, usermedia.url, usermedia.stillUrl, usermedia.duration FROM purchases JOIN usermedia ON purchases.mediaId = usermedia.id WHERE customerId=737340

            this.sequelize.query(
                "SELECT purchases.mediaId, purchases.date, usermedia.type, usermedia.userId, usermedia.cost, usermedia.previewUrl, usermedia.url, usermedia.stillUrl, usermedia.duration FROM purchases JOIN usermedia ON purchases.mediaId = usermedia.id WHERE customerId="+customerId,
                { type: QueryTypes.SELECT }
            ).then(results=>{
                observer.next({result:"OK", media:results});
            });
        });
    }

    public getBoughtMediaIDs(customerId:number):Observable<any>{
        return Observable.create(observer=>{
            const condition:any = {
                where: {
                    customerId: customerId
                },
                attributes:["mediaId"],
                raw : true
            };
            this.model.findAll(condition).then(data=>{
                if(data){
                    observer.next({result:"OK", collection:data});
                }
                else{
                    observer.next({result:"OK", collection:null});
                }
            });
        });
    }

    private getClassName():string{
        return this.constructor.toString().match(/\w+/g)[1];
    }

    private log(data:any):void{
        AppLogger.getInstance().log(data, this.getClassName());
    }
}