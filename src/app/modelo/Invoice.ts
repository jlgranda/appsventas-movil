import { Subject } from './Subject';
import { BaseObject } from './BaseObject';

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export class Invoice extends BaseObject {

    clienteId: number;
    fechaEmision: Date;
    importeTotal: number;

    //UX
    cliente: Subject;
    clienteNombre: string;
    
}