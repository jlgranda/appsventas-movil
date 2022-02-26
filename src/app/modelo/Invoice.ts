import { Subject } from './Subject';
import { BaseObject } from './BaseObject';
import { Product } from './Product';
import { SubjectCustomer } from './SubjectCustomer';

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export class Invoice extends BaseObject {

    customerId: number;
    fechaEmision: Date;
    importeTotal: number;

    //UX
    customer: SubjectCustomer;
    customerFullName: string;
    product: Product;
    
}