import { BaseObject} from './BaseObject';

export class UsuarioModel extends BaseObject{
    email:string;
    username:string;
    password:string;
    
    //Data User
    mobileNumber: string;
    firstname: string;
    surname: string;

    //Datos de facturación
    ruc: string;
    initials: string;
    direccion: string;

}