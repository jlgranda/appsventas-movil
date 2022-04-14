/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export class Product {

    id: number;
    uuid: string;

    name: string;
    price: number;
    productType: any = 'SERVICE';
    taxType: any = 'IVA';
    icon: string;
    photo: string;

    //Auxiliares
    categoryName: string;
    description: string;
    
    quantity: number = 1;
}