
export const validateDni = (cedula: string) => {
    if (cedula.length == 10) {
        const wced = cedula.substring(0, 9);
        const verif = cedula.substring(9, 10);

        let wd: number = 0;
        let wc: number = 0;
        let wa: number = 0;
        let wb: number = 0;

        for (let i = 0; i <= wced.length - 1; i = i + 2) {
            wa = +wced.substring(i, i + 1);
            wb = wa * 2;
            wc = wb;
            if (wb > 9) {
                wc = wb - 9;
            }
            wd = wd + wc;
        }

        wa = 0;
        for (let i = 1; i <= wced.length - 1; i = i + 2) {
            wa = +wced.substring(i, i + 1);
            wd = wd + wa;
        }
        let wn: number;
        wn = wd / 10;
        let wn2: number = Math.ceil(wn);
        wn2 = wn2 * 10;
        let digit: number = wn2 - wd;

        let verifNumber = new Number(verif);
        if (digit == verifNumber) {
            return true; //Valido
        } else {
            return false;
        }
    }

    return false;
}

export const validateRUC = (ruc: string) => {
    return ruc.length == 13;
}

export const validateDNIPattern = (value: string) => {
    const regexp = new RegExp('^[0-9]{2,13}$');
    return regexp.test(value.trim());
}
