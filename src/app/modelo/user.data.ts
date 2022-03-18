export interface UserData {
    
    id: number;
    uuid: string;
    
    email: string;
    username: string;
    nombre: string;
    bio: string;
    mobileNumber: string;

    //Datos de facturación
    ruc: string;
    initials: string;
    tieneCertificadoDigital:boolean;
    
    image: string;

}
