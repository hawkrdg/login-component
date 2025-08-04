import { Component, inject, ChangeDetectorRef, signal, model, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button'; 
import { MatSidenavModule } from '@angular/material/sidenav'; 
import { LoginComponent } from "./login/login.component";


@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatFormFieldModule,
    LoginComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  document = inject(DOCUMENT);
  
  showApp = signal(false);
  // showLogin = model(false);
  loginResult = model({loginStatus: false, name: '', roles: []});
  doLogout = signal(false);
  handleLogin = model('');

  title = 'Login Test';
  txtToday = (new Date).toLocaleDateString();
  currentTheme = signal('');
  currentLightDark = signal('');


  constructor(public cd: ChangeDetectorRef) {
    effect(() => {
      this.loginTrigger(this.loginResult);
    });
  }

  ngOnInit() {
    console.log('Main ngOnInit() fires...');
    this.currentTheme.set(localStorage.getItem('theme'));
    this.currentLightDark.set(localStorage.getItem('lightDark'));
    this.showApp.set(true);
  }
  
  ngAfterViewInit() {
    console.log('Main ngAfterViewInit() fires...');
    this.setTheme();
    this.setLightDark();
    // this.login();
  }

  //-- check roles...
  //
  isAdmin = () => {
    return ((this.loginResult().roles.indexOf('billing_admin') === -1 &&
             this.loginResult().roles.indexOf('meters_admin') === -1 &&
             this.loginResult().roles.indexOf('_admin') === -1) ? false : true);
  }
  isUser = () => {
    return (this.loginResult().roles.indexOf('billing_user') === -1 ? false : true);
  }

  //-- login stuff
  //
  login =  () => {
    if (this.loginResult().loginStatus) {
      this.handleLogin.set('LOGOUT');
    } else {
      this.handleLogin.set('LOGIN');
    }
  }

  loginTrigger = async (ev) => {
    console.log('loginResult has changed: ', this.loginResult());
  }

  doTheme = (theme) => {
    this.currentTheme.set(theme);
    this.setTheme();
  }
  doLightDark = (mode) => {
    this.currentLightDark.set(mode);
    this.setLightDark();
  }

  setTheme = () => {
    console.log(`setTheme() fires...`);
    const themeClassEl: any = document.getElementsByTagName('body')[0]
    themeClassEl.classList.remove('blueGreyTheme');
    themeClassEl.classList.remove('khakiTheme');

    themeClassEl.classList.add(this.currentTheme());
    localStorage.setItem('theme', this.currentTheme());
  }
  setLightDark = () => {
    const appEl: any = document.getElementsByTagName('body')[0]
    appEl.classList.remove('lightTheme');
    appEl.classList.remove('darkTheme');
    appEl.classList.add(this.currentLightDark());
    localStorage.setItem('lightDark', this.currentLightDark());
  }

}