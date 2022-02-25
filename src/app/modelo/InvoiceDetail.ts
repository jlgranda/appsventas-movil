import { BaseObject } from './BaseObject';

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export class InvoiceDetail extends BaseObject {

    invoiceId: number;
    productId: number;
    quantity: number = 1;
    unitValue: number = 1;
    totalValue: number = 0;

}