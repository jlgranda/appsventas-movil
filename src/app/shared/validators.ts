

import { AbstractControl } from '@angular/forms';

import { validateDni } from './helpers';

import { environment } from "src/environments/environment";

import { Directive } from '@angular/core';
import {
    NG_VALIDATORS,
    FormsModule,
    FormGroup,
    FormControl,
    ValidatorFn,
    Validators
} from '@angular/forms';

export function dniValidator(control: AbstractControl): { [key: string]: boolean } | null {
    
    console.log("dniValidator");
    if (!control.value) {
        return null;
    }
    
    if (   control.value === '0000000000' || control.value === '2222222222' 
        || control.value === '4444444444' || control.value === '5555555555'
        || control.value === '7777777777' || control.value === '9999999999' ) {
        return {
            dni: false
        };
    }
    const isValid = validateDni(control.value);

    return !isValid ? {
        dni: true
    } : null;
}


export function optionalValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const appConfig = environment.settings;
    if (!control.value) {
        return null;
    }

    if (control.value === '') {
        return {
            optional: true
        }
    }
    const pattern = appConfig['validationRegExp']['safeMultilineTextPattern'];
    var re = new RegExp(pattern);
    const isValid = re.test(control.value);

    return !isValid ? {
        optional: true
    } : null;
}
export function emailValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const appConfig = environment.settings;
    if (!control.value) {
        return null;
    }

    if (control.value === '') {
        return {
            optional: true
        }
    }
    const pattern = appConfig['validationRegExp']['emailPattern'];
    var re = new RegExp(pattern);
    const isValid = re.test(control.value);

    return !isValid ? {
        optional: true
    } : null;
}

@Directive({
  selector: '[cedulaDomain][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useValue: dniValidator,
      multi: true
    }
  ]
})

export class CedulaValidator {
}
