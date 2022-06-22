import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/services/auth-guard.service';
import { FacturaPopupComponent } from './factura-popup/factura-popup.component';
import { FacturaServicioComponent } from './factura-servicio/factura-servicio.component';
import { FacturaServicioRecibidasComponent } from './factura-servicio/factura-servicio-recibidas.component';
import { FacturasInvalidasPopupComponent } from './facturas-invalidas-popup/facturas-invalidas-popup.component';
import { ServiciosPopupComponent } from './servicios-popup/servicios-popup.component';

const routes: Routes = [
    {
        path: 'emitir',
        component: FacturaServicioComponent,
    },
    {
        path: 'recibir',
        component: FacturaServicioRecibidasComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FacturasRoutingModule { }
