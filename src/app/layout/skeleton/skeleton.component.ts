import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [],
  template: `<div class="welcome-skeleton skeleton"></div>`,
  styles: [
    `
      .welcome-skeleton {
        width: 100%;
        height: calc(100vh - 100px);
        text-align: center;
        animation: pulse 1.5s infinite ease-in-out;
      }

      .skeleton {
        background-color: #f2f6fb;
        border-radius: 4px;
        animation: pulse 1.5s infinite ease-in-out;
      }

      @keyframes pulse {
        0% {
          background-color: #f2f6fb;
        }

        50% {
          background-color: #e4eefa;
        }

        100% {
          background-color: #f2f6fb;
        }
      }
    `,
  ],
})
export class SkeletonComponent {}
