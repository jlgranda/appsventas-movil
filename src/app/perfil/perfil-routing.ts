import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertificadoPopupComponent } from './certificado-popup/certificado-popup.component';
import { InformacionSriComponent } from './informacion-sri/informacion-sri.component';
import { PerfilComponent } from './perfil/perfil.component';

const routes: Routes = [
    {
        path: '',
        component: PerfilComponent
    },
    {
        path: 'sri',
        component: InformacionSriComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PerfilRoutingModule { }