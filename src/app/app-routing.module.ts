import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { AuthGuard } from './core/services/auth-guard.service';
import { NoAuthGuard } from './auth/no-auth-guard.service';
import { AppResolver } from './app-resolver.service';
import { AuthComponent } from './auth/auth.component';
import { AppErrorComponent } from './pages/app.error.component';
import { RegistroComponent } from './perfil/registro/registro.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', loadChildren: () => import('./inicio/inicio.module').then(m => m.InicioModule)
            },
            { path: 'error404', component: AppErrorComponent },
            //            { path: 'access', component: AppAccessdeniedComponent },
            //            { path: 'notfound', component: AppNotfoundComponent },
            { path: 'login', component: AuthComponent },
            { path: 'registrar', component: RegistroComponent },

            //            { path: '**', redirectTo: '/notfound' },
        ], {
            scrollPositionRestoration: 'enabled',
            enableTracing: true, relativeLinkResolution: 'legacy'
        }
        )
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
