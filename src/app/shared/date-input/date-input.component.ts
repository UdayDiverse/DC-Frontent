import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-date-input',
  template: `
    <input
      type="text"
      [value]="displayValue"
      (input)="onInput($event)"
      (blur)="onTouched()"
      placeholder="DD/MM/YYYY"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true,
    },
  ],
})
export class DateInputComponent implements ControlValueAccessor {
  private innerValue: Date | null = null;
  displayValue: string = '';

  constructor(private datePipe: DatePipe) {}

  // Called by Angular when writing form value -> component
  writeValue(value: Date | null): void {
    this.innerValue = value;
    this.displayValue = value
      ? this.datePipe.transform(value, 'dd/MM/yyyy') || ''
      : '';
  }

  // Called when value changes inside component -> form
  onChange: any = () => {};
  onTouched: any = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // optional, handle disable
  }

  // Handle input changes
  onInput(value: any) {
    this.displayValue = value;
    const parts = value.split('/');
    if (parts.length === 3) {
      const day = +parts[0];
      const month = +parts[1] - 1;
      const year = +parts[2];
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        this.innerValue = date;
        this.onChange(date); // update form value
      }
    }
  }
}
