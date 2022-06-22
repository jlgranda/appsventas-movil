import { Product } from './Product';

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export class InvoiceDetail {

    product: Product;
    quantity: number = 1;
    subtotal: number = 0.00; //Sin Iva
    importeTotal: number = 0.00; //Con Iva
    iva0Total: number = 0.00;
    iva12Total: number = 0.00;
    aplicarIva12: boolean = false;
    amount: number = 0.00; //Cantidad de productos

}