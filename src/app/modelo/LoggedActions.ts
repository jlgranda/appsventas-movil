export class LoggedActions {
    eventId: number;
    schemaName:string;
    tableName:string;
    relid: number;
    sessionUserName:string;
    actionTstampTx: Date;
    actionTstampStm: Date;
    actionTstampClk: Date;
    transactionId: number;
    applicationName:string;
//    private Object clientAddr;
    clientPort: number;
    clientQuery:string;
    action:string;
}