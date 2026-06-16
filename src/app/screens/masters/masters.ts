import { Component, inject, signal } from '@angular/core';
import { LoggedInUserService } from '../../core/service/user.service';

@Component({
  selector: 'app-masters',
  imports: [],
  templateUrl: './masters.html',
  styleUrl: './masters.scss',
  standalone: true,
})
export class Masters {
  useService = inject(LoggedInUserService);
  userName = signal('');
  isFilters: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.userName = this.useService.getLoggedInUser();
  }
}
