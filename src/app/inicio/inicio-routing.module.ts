import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './inicio.component';
import { InicioAuthResolver } from './inicio-auth-resolver.service';
import { AuthGuard } from '../core';

const routes: Routes = [

    {
        path: '',
        component: InicioComponent,
        resolve: {
            isAuthenticated: InicioAuthResolver
        },
        children: [
            {
                path: 'facturas',
                loadChildren: () => import('src/app/facturas/facturas.module').then(m => m.FacturasModule),
                canActivate: [ AuthGuard ]
            },
            {
                path: 'contactos',
                loadChildren: () => import('src/app/contactos/contactos.module').then(m => m.ContactosModule),
                canActivate: [ AuthGuard ]
            },
            {
                path: 'servicios',
                loadChildren: () => import('src/app/servicios/servicios.module').then(m => m.ServiciosModule),
                canActivate: [ AuthGuard ]
            },
            {
                path: 'perfil',
                loadChildren: () => import('src/app/perfil/perfil.module').then(m => m.PerfilModule),
                canActivate: [ AuthGuard ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InicioRoutingModule { }
