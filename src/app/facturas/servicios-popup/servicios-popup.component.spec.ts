import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosPopupComponent } from './servicios-popup.component';

describe('ServiciosPopupComponent', () => {
  let component: ServiciosPopupComponent;
  let fixture: ComponentFixture<ServiciosPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiciosPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiciosPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
