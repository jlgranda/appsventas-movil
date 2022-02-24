import { BaseObject} from './BaseObject';

export class CatalogoModel extends BaseObject{
    nivel: number;
    catalogoId: number;
    grupoCatalogoId: number;
    tipoDatoRecogeBoolean: boolean;
    tipoDatoRecogeCaracter: boolean;
    tipoDatoRecogeNumeric: boolean;
    datoDefecto: string;
}