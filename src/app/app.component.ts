import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderBarComponent } from './layout/header-bar/header-bar.component';
import { SideBarComponent } from './layout/side-bar/side-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderBarComponent, SideBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent {
  protected title = 'delivery-challan';
}
