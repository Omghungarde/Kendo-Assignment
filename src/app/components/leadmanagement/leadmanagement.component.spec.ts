import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadmanagementComponent } from './leadmanagement.component';

describe('LeadmanagementComponent', () => {
  let component: LeadmanagementComponent;
  let fixture: ComponentFixture<LeadmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadmanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
