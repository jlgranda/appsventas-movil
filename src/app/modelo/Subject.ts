import { BaseObject } from './BaseObject';

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export class Subject extends BaseObject {

    firstname: string;
    surname: string;
    username: string;
    password: string;
    passwordSalt: string;
    photo: string;
    email: string;
    mobileNumber: string;
    workPhoneNumber: string;
    confirmed: boolean;
    loggedIn: boolean;
    emailSecret: boolean;
    screenName: string;
    bio: string;
    fedeEmail: string;
    fedeEmailPassword: string;
    ruc: string;
    initials: string;
    numeroContribuyenteEspecial: string;
    contactable: boolean;
    nonnative: boolean;
    date_birth: Date;
    subjectType: string;

}

