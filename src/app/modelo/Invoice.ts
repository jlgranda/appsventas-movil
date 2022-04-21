import { Subject } from './Subject';
import { BaseObject } from './BaseObject';
import { Product } from './Product';
import { SubjectCustomer } from './SubjectCustomer';
import { InvoiceDetail } from './InvoiceDetail';
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export class Invoice {

    id: number;
    uuid: string;
    description: string;

    emissionOn: Date;
    fechaEmision: string;
    amount: number = 0;
    subTotal: number = 0.00;
    subTotalIva0: number = 0.00;
    subTotalIva12: number = 0.00;
    iva0Total: number = 0.00;
    iva12Total: number = 0.00;
    importeTotal: number = 0.00;//Con Iva
    iva12: boolean = false;
    descuento: number = 0.00;
    propina: number = 0.00;

    subjectCustomer: SubjectCustomer;
    product: Product;
    details: InvoiceDetail[] = [];
    payments: any[];

    //UX
    customerFullName: string;
    subjectFullName: string;
    resumen: string;

    //SRI
    estab: string = "001";
    ptoEmi: string = "001";
    secuencial: string;
    enviarSRI: boolean = false;
    accionSRI: string;
    claveAcceso: string;
    isPayment: boolean;

    tipoFactura: string;

    customerRUC: string;
    customerEmail: string;
    numeroAutorizacion: string;
    authorizationDate: Date;

}