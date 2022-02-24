import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/services/auth-guard.service';
import { FacturaServicioComponent } from './factura-servicio/factura-servicio.component';

const routes: Routes = [

    {
        path: '',
        component: FacturaServicioComponent
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturasRoutingModule {}
