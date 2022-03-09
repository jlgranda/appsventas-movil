/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { Subject } from './Subject';

export class SubjectCustomer {

    id: number;
    uuid: string;

    subjectId: number;
    customerId: number;

    //Auxiliares
    customer: Subject;
    customerCode: string;
    customerFullName: string;
    customerInitials: string;
    customerEmail: string;
    customerPhoto: string;
}