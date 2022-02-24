import { Directive, OnInit, ElementRef, Renderer2, NgModule, HostListener} from '@angular/core';

@Directive({
  selector: '[required]'
})
export class MarkAsteriskDirective implements OnInit {

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit() {
    const parent = this.renderer.parentNode(this.el.nativeElement);
    if (parent.getElementsByTagName('LABEL').length && !parent.getElementsByClassName('required-asterisk').length) {
      parent.getElementsByTagName('LABEL')[0].innerHTML += '<span class="required-asterisk">*</span>';
    }
  }
}

const DISABLE_TIME = 300;

@Directive({
    selector: 'button[n-submit]'
})
export class DisableButtonOnSubmitDirective {
    constructor(private elementRef: ElementRef) { }
    //@HostListener('click', ['$event'])
    @HostListener('click')
    clickEvent() {
        this.elementRef.nativeElement.setAttribute('disabled', 'true');
        setTimeout(() => this.elementRef.nativeElement.removeAttribute('disabled'), DISABLE_TIME);
    }
}

@NgModule({
  declarations: [ MarkAsteriskDirective, DisableButtonOnSubmitDirective ],
  exports: [ MarkAsteriskDirective, DisableButtonOnSubmitDirective ]
})

export class MarkAsteriskDirectiveModule {}