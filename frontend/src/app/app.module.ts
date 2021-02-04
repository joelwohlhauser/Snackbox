import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// App Components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { SmsTokenDialogComponent } from './components/sms-token-dialog/sms-token-dialog.component';
import { ChangeImageDialogComponent } from './components/change-image-dialog/change-image-dialog.component';
import { RecipeComponent } from './components/recipe/recipe.component';
import { ExploreComponent } from './components/explore/explore.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuardUser, AuthGuardAdmin } from './helpers/auth.guard';

// Google Login
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';


const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recipe', redirectTo: 'recipe/new', pathMatch: 'full' },
  { path: 'recipe/:recipeId', component: RecipeComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'dashboard', redirectTo: 'user/dashboard', pathMatch: 'full' },
  { path: 'user/dashboard', component: DashboardComponent, canActivate: [AuthGuardUser] },
  { path: 'admin/dashboard', component: DashboardComponent, canActivate: [AuthGuardAdmin] },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];


const materialModules = [
  MatToolbarModule,
  MatButtonModule,
  MatCardModule,
  MatInputModule,
  MatFormFieldModule,
  MatIconModule,
  MatDialogModule,
  MatGridListModule,
  MatButtonToggleModule,
  MatTableModule,
  MatSortModule,
  MatSnackBarModule
]


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    WelcomeComponent,
    SmsTokenDialogComponent,
    ChangeImageDialogComponent,
    RecipeComponent,
    ExploreComponent,
    DashboardComponent
  ],
  imports: [
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule,
    materialModules
  ],
  exports: [
    RouterModule,
    materialModules
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '    your id    ' + '.apps.googleusercontent.com'
            )
          }
        ]
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
