import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/services/auth-guard.service';
import { FacturaServicioComponent } from './factura-servicio/factura-servicio.component';
import { FacturasInvalidasPopupComponent } from './facturas-invalidas-popup/facturas-invalidas-popup.component';

const routes: Routes = [
    {
        path: '',
        component: FacturaServicioComponent,
        
    },
    {
        path: 'invalidas',
        component: FacturasInvalidasPopupComponent,
        
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FacturasRoutingModule { }
