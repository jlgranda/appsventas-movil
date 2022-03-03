import { Subject } from './Subject';
import { BaseObject } from './BaseObject';
import { Product } from './Product';
import { SubjectCustomer } from './SubjectCustomer';
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export class Invoice {

    id: number;
    uuid: string;

    emissionOn: Date;
    subTotal: number = 0.00;
    descuento: number = 0.00;
    propina: number = 0.00;
    iva0Total: number = 0.00;
    iva12Total: number = 0.00;
    importeTotal: number = 0.00;
    
    subjectCustomer: SubjectCustomer;
    product: Product;
    
    details: any[];
    payments: any[];


    //UX
    customerFullName: string;

}