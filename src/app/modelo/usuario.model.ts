import { BaseObject} from './BaseObject';

export class UsuarioModel extends BaseObject{
    email:string;
    username:string;
    password:string;
    
    //UX
    description: string;
    mobileNumber: string;
    codigoNombre: string;
}