import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitucionesBancariasPopupComponent } from './instituciones-bancarias-popup.component';

describe('InstitucionesBancariasPopupComponent', () => {
  let component: InstitucionesBancariasPopupComponent;
  let fixture: ComponentFixture<InstitucionesBancariasPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstitucionesBancariasPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstitucionesBancariasPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
