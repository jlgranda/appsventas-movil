import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Product } from 'src/app/modelo/Product';

@Component({
    selector: 'app-servicio-detail-popup',
    templateUrl: './servicio-detail-popup.component.html',
    styleUrls: ['./servicio-detail-popup.component.scss']
})
export class ServicioDetailPopupComponent implements OnInit {

    @Input() description: string;
    @Input() product: Product;

    constructor(
        private modalController: ModalController
    ) { }

    ngOnInit(): void {
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    };

    async addDescription(event) {
        await this.modalController.dismiss(this.description);
    }

}
