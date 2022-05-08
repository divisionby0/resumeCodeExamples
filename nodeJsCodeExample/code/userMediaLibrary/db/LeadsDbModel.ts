import {Observable} from "rxjs";
import {AppLogger} from "../../services/logging/AppLogger";
declare function require(data:any):any;
const {Sequelize, DataTypes, Op, Models, QueryTypes } = require('sequelize');

export class LeadsDbModel {
    private model:any;
    private sequelize:any;

    constructor(sequelize:any) {
        this.sequelize = sequelize;
        this.createModel(sequelize);
    }

    private createModel(sequelize:any):void{
        this.model = sequelize.define('LeadsModel',{
                action: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                productId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                leadId: {
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
                tableName: 'leads',
                modelName: 'LeadsModel'
            });
    }
    
    public createPreviewReview(productId:number, leadId:number):Observable<any>{
        const that = this;
        return Observable.create(observer=>{
            const createObject:any = {
                productId:productId,
                leadId:leadId,
                action:0
            };

            this.model.create(
                createObject
            ).then((data:any)=>{
                that.log("create preview review response data="+JSON.stringify(data));
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
    
    public getPreviewReviews(productId:number):Observable<any>{
        return Observable.create(observer=>{
            const condition:any = {
                where: {
                    productId: productId,
                    action:0
                }
            };
            
            this.model.findAll(condition).then(data=>{
                if(data){
                    observer.next({result:"OK",previewReviews:data});
                }
                else{
                    observer.next({result:"ERROR", error:"No preview reviews found"});
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