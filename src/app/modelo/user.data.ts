export interface UserData {
    id: number;
    email: string;
    uuid: string;
    username: string;
    nombre: string;
    bio: string;
    mobileNumber: string;

    //Datos de facturación
    ruc: string;
    initials: string;
    direccion: string;
    tieneCertificadoDigital:boolean;
}
