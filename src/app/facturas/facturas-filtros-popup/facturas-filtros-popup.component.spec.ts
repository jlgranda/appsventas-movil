import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasFiltrosPopupComponent } from './facturas-filtros-popup.component';

describe('FacturasFiltrosPopupComponent', () => {
  let component: FacturasFiltrosPopupComponent;
  let fixture: ComponentFixture<FacturasFiltrosPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacturasFiltrosPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturasFiltrosPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
