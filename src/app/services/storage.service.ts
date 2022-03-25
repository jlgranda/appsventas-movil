import { Injectable } from '@angular/core';
import { Storage } from "@ionic/storage";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private _storage: Storage | null = null;

    constructor(private storage: Storage) {
        this.init();
    }

    async init() {
        const storage = await this.storage.create();
        this._storage = storage;
    }

    async set(key: string, value: any) {
        this._storage?.set(key, value);
    }

    async get(key: string) {
        return this.storage.get(key).then();
    }

}
