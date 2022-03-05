import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Product } from 'src/app/modelo/Product';

@Component({
    selector: 'app-servicio-popup',
    templateUrl: './servicio-popup.component.html',
    styleUrls: ['./servicio-popup.component.scss']
})
export class ServicioPopupComponent implements OnInit {

    @Input() product: Product;
    iva12: boolean = true;

    constructor(
        private modalController: ModalController,
    ) { }

    ngOnInit(): void {
    }

    async cancel(event) {
        await this.modalController.dismiss(null);
    };

    async agregarProduct(event, p: Product) {
        if (!this.iva12) {
            p.taxType = 'NONE';
        }
        await this.modalController.dismiss(p);
    };

}
