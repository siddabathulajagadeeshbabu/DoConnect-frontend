// src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';   // Import icons

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatIconModule
  ],
  template: `
  <div class="center">
    <mat-card class="auth-card">
      <h2>Login</h2>
      <form [formGroup]="f" (ngSubmit)="submit()">
        
        <mat-form-field appearance="outline" class="full">
          <mat-label>Username or Email</mat-label>
          <input matInput formControlName="usernameOrEmail" />
        </mat-form-field>

        <!-- Password field with Eye icon -->
        <mat-form-field appearance="outline" class="full">
          <mat-label>Password</mat-label>
          <input matInput [type]="hide ? 'password' : 'text'" formControlName="password" />
          <button mat-icon-button matSuffix type="button" (click)="hide = !hide">
            <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
        </mat-form-field>

        <button mat-flat-button color="primary" [disabled]="f.invalid">Login</button>
        <button mat-button routerLink="/auth/register" type="button">Register</button>
      </form>
    </mat-card>
  </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  hide = true;  // password hidden by default

  f: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.f = this.fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.f.invalid) return;
    this.auth.login(this.f.value).subscribe({
      next: () => {
        this.snack.open('Logged in', 'ok', { duration: 1200 });
        this.router.navigate(['/questions']);
      },
      error: (e) => {
        console.error(e);
        this.snack.open(e?.error?.message || 'Login failed', 'ok');
      }
    });
  }
}
