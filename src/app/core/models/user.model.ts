import { Organization } from 'src/app/modelo/Organization';

export interface User {
    id: number;
    email: string;
    token: string;
    uuid: string;
    username: string;
    nombre: string;
    bio: string;
    image: string;
    roles: string[];
    rolSelected: string;
    mobileNumber: string;

    //Datos de facturación
    ruc: string;
    initials: string;
    direccion: string;

    //Datos de organización
    organization: Organization;
    tieneCertificadoDigital:boolean;
}
