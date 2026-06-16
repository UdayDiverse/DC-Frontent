import { Component, inject, signal } from '@angular/core';
import { LoggedInUserService } from '../../core/service/user.service';

@Component({
  selector: 'app-user-blocked',
  imports: [],
  template: `
    <div class="welcome-intro">
      <h1>
        <img
          src="../../../assets/images/icons/users-slash.svg"
          alt=""
          width="40px"
        />
        Oops!
      </h1>
      <h2>Dear {{ userName() }}</h2>
      <p>
        You have defaulted RGP challans atleast 5 times, hence you are
        restricted to use this system. Please contact your Admin for the
        resolution
      </p>
    </div>
  `,
  styles: [
    `
      .welcome-intro {
        width: 500px;
        margin: 150px auto 0;
        text-align: center;
        h1 {
          font-size: 27px;
          font-weight: 600;
          color: #738193;
        }

        h2 {
          font-size: 27px;
          font-weight: 600;
          margin-top: 15px;
          margin-bottom: 15px;
          color: #4e4e4e;
        }

        p {
          font-size: 17px;
          line-height: 24px;
          color: var(--gray1);
        }
      }
    `,
  ],
  standalone: true,
})
export class UserBlockedComponent {
  useService = inject(LoggedInUserService);
  userName = signal('');
  isFilters: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.userName = this.useService.getLoggedInUser();
  }
}
