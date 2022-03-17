import { Organization } from 'src/app/modelo/Organization';

export interface User {

    id: number;
    uuid: string;
    email: string;
    username: string;
    nombre: string;
    bio: string;
    image: string;
    token: string;
    roles: string[];
    rolSelected: string;

    //Data User
    code: string;
    mobileNumber: string;
    firstname: string;
    surname: string;

    //Datos de facturación
    ruc: string;
    initials: string;
    direccion: string;

    //Estado para ejecutar facturación electrónica
    tieneCertificadoDigital: boolean;
    
    //Datos de organización
    organization: Organization;
}
