//-- plugable couchDB login component - login, change password, logout
//   two-way binding to showLoginComponent, dbEndpoint, loginResult,
//   input binding to doLogout.
//
//   <app-login
//      [(showLoginComponent)]="showLoginCtl"
//      [(dbEndpoint)]="couchURL"
//      [(loginResult)]="userObj"
//      [doLogout]="doLogout">
//   </app-login>
//
//   all HTTP calls are included so no services dependancies. this can be stand-alone...
//
import { Component, ViewChild, ElementRef, input, model, signal, effect, output } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from '@angular/material/button'; 
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
}) export class LoginComponent {
  dbEndpoint = input('');
  doLogin = model('');
  showLoginComponent = signal(false);
  loginResult = model<any>();
  
  //-- use this to focus this field...
  //
  @ViewChild('loginTxt') loginTxt!: ElementRef
  
  showPassword = signal(false);
  userName = '';
  userPassword = '';
  newPassword = '';
  loginMessage = '';
  isError = signal(false);
  isLoggingOut = signal(false);
  isChangingPW = signal(false);
  disableBtns = signal(false);
  httpResult: any;

  constructor(private http: HttpClient) {
    effect(() => {
      this.focusLoginName(this.showLoginComponent());
    });
    effect(() => {
      this.handleLogin(this.doLogin());
    });
  }

  ngOnInit() {
    console.log('login ngOnInit() fires...')
    this.userName = '';
    this.userPassword = '';
    this.newPassword = '';
  }

  ngAfterViewInit() {
    console.log('login ngAfterViewInit() fires...');
  }
  
  focusLoginName = (data) => {
    setTimeout(() => {
      if (!this.isLoggingOut()) {
        console.log('focusLoginName() fires...')
        this.userName = '';
        this.userPassword = '';
        this.loginMessage = '';
        this.newPassword = '';
        this.showPassword.set(false);
        this.loginTxt.nativeElement.focus();
      }
    }, 500);
  }

  handleLogin = async (ev) => {
    switch (ev) {
      case 'LOGIN':
        this.showLoginComponent.set(true);
        break;
    
        case 'LOGOUT':
        this.isLoggingOut.set(true);
        this.showLoginComponent.set(true);
        this.logout();
        break;
    
      default:
        break;
    }
  }

  login = async () => {
    this.loginMessage = '';
    this.isError.set(false);
    this.httpResult = {};
    
    if (!this.userName || !this.userPassword) {
      this.isError.set(true);
      this.loginMessage = 'ERROR!\n\n Must have \'User Name\' AND \'Password\'';
    } else {
      try {
        this.loginMessage = 'Logging in...';
        this.disableBtns.set(true);
        await this.delay(1000);

        await this.promiseLogin(this.userName, this.userPassword).then(
          (data: any) => {
            this.loginMessage = 'SUCCESS...';
            this.httpResult = {loginStatus: true, name: data.name, roles: data.roles};
            this.userName = '';
            this.userPassword = '';
          },  
          (err: any) => {
            this.isError.set(true);
            console.log(`LOGIN ERROR:\n\n${JSON.stringify(err.error, null, 4)}`);
            this.loginMessage = JSON.stringify(err.error, null, 4);
            throw(this.loginMessage);
          }  
        );  
        
      } catch (error: any) {
        this.loginMessage = error;
      }
      
      await this.delay(1000);
      
      if (this.isError()) {
        this.focusLoginName('');
      } else {
        this.loginMessage = '';
        this.loginResult.update(v => this.httpResult);
        this.showLoginComponent.update(v => false);
      }
      this.disableBtns.set(false);
    }  
  }  

  logout = async () => {
    console.log(`logout() fires...`);
    this.isError.set(false);
    this.loginMessage = 'Logging out...';
    this.httpResult = {};
    this.disableBtns.set(true);
    this.isLoggingOut.set(true);

    await this.delay(1000);

    try {
      await this.promiseLogout().then(
        (data: any) => {
          this.loginMessage = 'SUCCESS...'
          this.httpResult = {loginStatus: false, name: '', roles: []};
          this.userName = '';
          this.userPassword = '';
        },
        (err: any) => {
          this.isError.set(true);
          console.log(`LOGOUT ERROR:\n\n${JSON.stringify(err.error, null, 4)}`);
          this.loginMessage = JSON.stringify(err.error, null, 4);
          throw(this.loginMessage);
        }
      )  
    } catch (error: any) {
      this.loginMessage = error;
    }

    await this.delay(2000);
    if (!this.isError()) {
      this.loginResult.update(v => this.httpResult);
    }
    this.disableBtns.set(false);
    this.loginMessage = '';
    this.isLoggingOut.set(false);
    this.showLoginComponent.update(v => false);
  }

  changePassword = async () => {
    this.isError.set(false);
    this.loginMessage = '';
    this.newPassword = '';
    
    if (!this.userName || !this.userPassword) {
      this.isError.set(true);
      this.loginMessage = 'ERROR!\n\n Must have \'User Name\' AND \'Password\'...';
    } else {
      this.isChangingPW.set(true);
    }
  }

  savePassword = async () => {
    this.isError.set(false);
    this.loginMessage = '';

    if (!this.newPassword) {
      this.isError.set(true);
      this.loginMessage = 'ERROR!\n\n Must have \'New Password\'...';
    } else {
      try {
        this.disableBtns.set(true);

        //-- login...
        //
        this.loginMessage = 'Logging in...';
        
        await this.promiseLogin(this.userName, this.userPassword).then(
          (data: any) => {
      
            // console.log(`Logged in as ${data.name}`);
          },
          (err: any) => {
            console.log(`ERROR logging in...\n${JSON.stringify(err, null, 2)}`);
            this.loginMessage = 'ERROR logging in...';
            throw(this.loginMessage);
          }
        );
        await this.delay(2000);

        //- fetch user record...
        //
        this.loginMessage = 'Fetching user record...'
        let userRec;
        
        await this.promiseGetUser(this.userName).then(
          (data: any) => {
            userRec = data;
            userRec.password = this.newPassword;  //-- add the new password...
            // console.log(`userRec:\n${JSON.stringify(userRec, null, 2)}`);
          },
          (err: any) => {
            console.log(`ERROR fetching user record\n${JSON.stringify(err, null, 2)}`);
            this.loginMessage = 'ERROR fething user record...';
            throw(this.loginMessage);
          }
        );
        await this.delay(2000);

        // update the user rec...
        //
        this.loginMessage = 'Updating user password...'
        await this.delay(1000);

        await this.promiseUpdateUser(this.userName, userRec).then(
          (data: any) => {
            // console.log(`Password updated:\n${JSON.stringify(data, null, 2)}`);
            this.userPassword = this.newPassword;
            this.loginMessage = 'Success...';
          },
          (err: any) => {
            console.log(`ERROR updating user record\n${JSON.stringify(err, null, 2)}`);
            this.loginMessage = 'ERROR updating user record...';
            throw(this.loginMessage);
          }
        );
      } catch (error: any) {
        this.loginMessage = error;
      }
      await this.delay(2000);
      this.loginMessage = '';
      this.disableBtns.set(false);
      this.isChangingPW.set(false);
    }
  }
  
  

  cancel = async () => {
    if (this.isChangingPW()) {
      this.isChangingPW.set(false);
    } else {
      this.userName = '';
      this.userPassword = '';
    }
    this.isError.set(false);
    this.loginMessage = '';
    this.doLogin.set('CANCEL');
    this.showLoginComponent.update(v => false);
  }  
  
//-- couchDB methods - this could be changed for a different back-end...

  couchUrl = this.dbEndpoint().endsWith('/') ? 
                   this.dbEndpoint() : this.dbEndpoint() + '/';

  //-- promiseLogin() - login in a user for cookie auth...
  //
  promiseLogin = async (name, password) => {
    let url = this.dbEndpoint();
    url = url.endsWith('/') ? url + '_session' : url + '/_session';

    return lastValueFrom(this.http.post(url, {name: name, password: password}, {withCredentials: true}));
  }

  //-- promiseLogout() - logout the current user...
  //
  promiseLogout = () => {
    let url = this.dbEndpoint();
    url = url.endsWith('/') ? url + '_session' : url + '/_session';
    
    return lastValueFrom(this.http.delete(url, {withCredentials: true}));
  }

  //-- promiseGetUser() - get _users/org.couchdb.user:userName...
  //
  promiseGetUser = (userName: String): Promise<any> => {
    let url = this.dbEndpoint();
    url = url.endsWith('/') ? 
            url + '_users/org.couchdb.user:' + userName : 
            url + '/_users/org.couchdb.user:' + userName;
    
    return lastValueFrom(this.http.get(url, {withCredentials: true}));
  }

  //-- promiseUpdateUser() - update _users/org.couchdb.user:userName...
  //
  promiseUpdateUser = (userName: String, userData: any): Promise<any> => {
    let url = this.dbEndpoint();
    url = url.endsWith('/') ? 
            url + '_users/org.couchdb.user:' + userName : 
            url + '/_users/org.couchdb.user:' + userName;
    
    return lastValueFrom(this.http.put(url, userData, {withCredentials: true}));
  }
//-- END - CouchDb section...


//-- utilities...
//
  //-- delay as a promise for async / await...
  //
  delay = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    }).then(() => {
      'delay'
    });
  }
}
