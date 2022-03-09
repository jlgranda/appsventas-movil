import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturaPopupComponent } from './factura-popup.component';

describe('FacturaPopupComponent', () => {
  let component: FacturaPopupComponent;
  let fixture: ComponentFixture<FacturaPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacturaPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturaPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
