import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/admin.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  questions: any[] = [];
  answers: any[] = [];

  constructor(
    @Inject(AdminService) private admin: AdminService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPending();
  }

  private handleAuthError(err: HttpErrorResponse) {
    if (err.status === 401 || err.status === 403) {
      this.router.navigate(['/questions']);
      return true;
    }
    return false;
  }

  loadPending() {
    this.admin.getPendingQuestions().subscribe({
      next: res => (this.questions = res.map((q: any) => ({ ...q, status: null }))),
      error: e => {
        if (!this.handleAuthError(e)) console.error(e);
      }
    });

    this.admin.getPendingAnswers().subscribe({
      next: res => (this.answers = res.map((a: any) => ({ ...a, status: null }))),
      error: e => {
        if (!this.handleAuthError(e)) console.error(e);
      }
    });
  }

  markApproved(item: any, type: 'q' | 'a') {
    item.status = 'approved';
    if (type === 'q') {
      this.approveQuestion(item.id);
    } else {
      this.approveAnswer(item.id);
    }
  }

  markRejected(item: any, type: 'q' | 'a') {
    item.status = 'rejected';
    if (type === 'q') {
      this.rejectQuestion(item.id);
    } else {
      this.rejectAnswer(item.id);
    }
  }

  approveQuestion(id: string) {
    this.admin.approveQuestion(id).subscribe({
      next: () => {
        this.snack.open('Question Approved', 'ok', { duration: 2000 });
      },
      error: (e: HttpErrorResponse) => {
        if (!this.handleAuthError(e)) {
          this.snack.open('Operation failed', 'ok', { duration: 1500 });
        }
      }
    });
  }

  rejectQuestion(id: string) {
    this.admin.rejectQuestion(id).subscribe({
      next: () => {
        this.snack.open('Question Rejected', 'ok', { duration: 2000 });
      },
      error: (e: HttpErrorResponse) => {
        if (!this.handleAuthError(e)) {
          this.snack.open('Operation failed', 'ok', { duration: 1500 });
        }
      }
    });
  }

  approveAnswer(id: string) {
    this.admin.approveAnswer(id).subscribe({
      next: () => {
        this.snack.open('Answer Approved', 'ok', { duration: 2000 });
      },
      error: (e: HttpErrorResponse) => {
        if (!this.handleAuthError(e)) {
          this.snack.open('Operation failed', 'ok', { duration: 1500 });
        }
      }
    });
  }

  rejectAnswer(id: string) {
    this.admin.rejectAnswer(id).subscribe({
      next: () => {
        this.snack.open('Answer Rejected', 'ok', { duration: 2000 });
      },
      error: (e: HttpErrorResponse) => {
        if (!this.handleAuthError(e)) {
          this.snack.open('Operation failed', 'ok', { duration: 1500 });
        }
      }
    });
  }
}
