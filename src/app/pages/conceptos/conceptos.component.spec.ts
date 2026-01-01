import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptosComponent } from './conceptos.component';

describe('ConceptosComponent', () => {
  let component: ConceptosComponent;
  let fixture: ComponentFixture<ConceptosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConceptosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
