import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-perfil-photo-popup',
    templateUrl: './perfil-photo-popup.component.html',
    styleUrls: ['./perfil-photo-popup.component.scss']
})
export class PerfilPhotoPopupComponent implements OnInit {

    constructor(
        private modalController: ModalController,
    ) { }

    ngOnInit(): void {
    }

    irAPopupCancel() {
        this.modalController.dismiss(null, 'backdrop');
    }
    
    startCapture(type) {
        this.modalController.dismiss(type, 'select');
    }

}
