import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AssessmentFormComponent } from './assessment-form.component';

describe('AssessmentFormComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AssessmentFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
  });

  it('form is invalid when title is empty', () => {
    const fixture = TestBed.createComponent(AssessmentFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({ title: '', timeLimitMinutes: 60 });
    expect(component.form.get('title')?.invalid).toBe(true);
  });

  it('form is invalid when timeLimitMinutes is zero', () => {
    const fixture = TestBed.createComponent(AssessmentFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({ title: 'Valid Title', timeLimitMinutes: 0 });
    expect(component.form.get('timeLimitMinutes')?.invalid).toBe(true);
  });

  it('form is invalid when timeLimitMinutes is negative', () => {
    const fixture = TestBed.createComponent(AssessmentFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({ title: 'Valid Title', timeLimitMinutes: -5 });
    expect(component.form.get('timeLimitMinutes')?.invalid).toBe(true);
  });

  it('form is valid when title and timeLimitMinutes are provided', () => {
    const fixture = TestBed.createComponent(AssessmentFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({ title: 'Java Assessment', description: '', timeLimitMinutes: 60 });
    expect(component.form.valid).toBe(true);
  });

  it('submit marks form as touched when invalid', () => {
    const fixture = TestBed.createComponent(AssessmentFormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({ title: '', timeLimitMinutes: null });
    component.submit();
    expect(component.form.get('title')?.touched).toBe(true);
  });
});
