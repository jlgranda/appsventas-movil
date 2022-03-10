export interface User {
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
}
