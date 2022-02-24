import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './inicio.component';
import { InicioAuthResolver } from './inicio-auth-resolver.service';

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
                loadChildren: () => import('src/app/facturas/facturas.module').then(m => m.FacturasModule)
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InicioRoutingModule { }
