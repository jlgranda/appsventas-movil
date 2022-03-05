import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactoPopupComponent } from './contacto-popup.component';

describe('ContactoPopupComponent', () => {
  let component: ContactoPopupComponent;
  let fixture: ComponentFixture<ContactoPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactoPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
