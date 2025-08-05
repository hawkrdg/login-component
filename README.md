# Angular Login Component
A simple angular app demonstrating a stand-alone login component for CouchDB using CouchDB's _users DB.
All http calls are atomic so the logic could be reworked for some other backend.

Uses angular signal library:

```
  <app-login [dbEndpoint]="'PathToCouchDBServer'" 
             [(loginResult)]="loginResult"
             [(doLogin)]="handleLogin">
  </app-login>
```
And inside the login component:

```
...export class LoginComponent {
  dbEndpoint = input('');
  //-- doLogin.set('LOGIN') or doLogin.set('LOGOUT')...
  doLogin = model('');
  loginResult = model<any>();
          .
          .
          .
}
```

doLogin() is bound to an 'effect()' in both the component and the consumer...

```
  effect(() => {
    this.handleLogin(this.doLogin());
  });
```

This effect() fires whenever doLogin() changes. In the main app handleLogin(ev) can then load data, enable tabs / pages, etc...

You can view this demo at https://hawkrdg.com/sandbox1
  