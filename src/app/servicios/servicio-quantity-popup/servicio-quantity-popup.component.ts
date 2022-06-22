import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Product } from 'src/app/modelo/Product';

@Component({
    selector: 'app-servicio-quantity-popup',
    templateUrl: './servicio-quantity-popup.component.html',
    styleUrls: ['./servicio-quantity-popup.component.scss']
})
export class ServicioQuantityPopupComponent implements OnInit {

    @Input() product: Product;

    constructor(
        private modalController: ModalController,
    ) { }

    ngOnInit(): void {
        this.product.amount = this.product.amount ? this.product.amount : 1;
    }

    async irAPopupCancel(event) {
        await this.modalController.dismiss(null);
    }

    async addQuantity(event) {
        await this.modalController.dismiss(this.product);
    }
    async removeQuantity(event) {
        this.product.amount = 0;
        await this.modalController.dismiss(this.product);
    }

    /**
    * Utilitarios
    */
    decrementQuantity(event) {
        if (event && this.product.amount >= 2) {
            this.product.amount -= 1;
        }
    }

    incrementQuantity(event) {
        if (event) {
            this.product.amount += 1;
        }
    }

}
