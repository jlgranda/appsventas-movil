import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerfilComponent } from './perfil/perfil.component';
import { CertificadoComponent } from './certificado/certificado.component';

const routes: Routes = [
    {
        path: '',
        component: PerfilComponent
    },
    {
        path: 'certificado',
        component: CertificadoComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PerfilRoutingModule { }