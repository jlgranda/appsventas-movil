import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, AbstractControl } from '@angular/forms';

@Directive({
  selector: '[formRepeatValue]',
  providers: [{provide: NG_VALIDATORS, useExisting: RepeatValueDirective, multi: true}]
})
export class RepeatValueDirective {

  @Input('formRepeatValue') listData: any[];

  validate(control: AbstractControl): {[key: string]: any} | null {
    return this.listData.includes(control.value) ? { listData: { value: control.value } }: null;
  }

}
