import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { QuestionService } from '../../../core/question.service';
import { AdminService } from '../../../core/admin.service';
import { AuthService } from '../../../core/auth.service';
import { debounceTime, firstValueFrom } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatInputModule, ReactiveFormsModule, MatListModule,
    MatPaginatorModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="page">
      <!-- Toolbar -->
      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-box">
          <mat-label>Search questions</mat-label>
          <input matInput [formControl]="search" placeholder="Type to search..." />
        </mat-form-field>
        <button mat-icon-button color="primary" (click)="onSearchClick()">
          <mat-icon>search</mat-icon>
        </button>
        <button mat-flat-button color="primary" routerLink="/questions/ask">Ask Question</button>
      </div>

      <!-- Questions -->
      <ng-container *ngIf="questions.length > 0; else noData">
        <mat-card *ngFor="let q of questions" class="q-card">
          <mat-card-content>
            <div class="row">
              <!-- thumbnail -->
              <div class="thumb-wrap">
                <img
                  *ngIf="q.images?.length; else noImg"
                  class="thumb"
                  [src]="asUrl(q.images[0])"
                  alt="question image" />
                <ng-template #noImg>
                  <div class="thumb placeholder">
                    <mat-icon>image_not_supported</mat-icon>
                  </div>
                </ng-template>
              </div>

              <!-- text -->
              <div class="meta">
                <mat-card-title class="title">{{ q.title }}</mat-card-title>
                <p class="snippet">{{ q.text | slice:0:200 }}{{ q.text?.length > 200 ? '…' : '' }}</p>
                <small class="author">By {{ q.author || 'Anonymous' }} • {{ q.createdAt | date }}</small>
              </div>
            </div>
          </mat-card-content>

          <!-- Actions -->
          <mat-card-actions>
            <button mat-stroked-button color="primary" [routerLink]="['/questions', q.id]">
              <mat-icon>visibility</mat-icon> View
            </button>
            <button
              *ngIf="isAdmin"
              mat-stroked-button
              color="warn"
              (click)="onDelete(q.id, q.title)">
              <mat-icon>delete</mat-icon> Delete
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Pagination -->
        <mat-paginator
          [length]="total" [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 20]"
          (page)="onPage($event)">
        </mat-paginator>
      </ng-container>

      <!-- Empty -->
      <ng-template #noData>
        <p class="text-center text-gray-500 mt-6">No question found</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .page {
      padding: 20px;
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .search-box {
      flex: 1;
    }

    /* Card styles */
    .q-card {
      margin-bottom: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .q-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }

    /* Content layout */
    .row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .thumb-wrap {
      flex: 0 0 auto;
    }

    .thumb {
      width: 160px;
      height: 110px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .placeholder {
      width: 160px;
      height: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px dashed #cfcfcf;
      color: #9e9e9e;
      font-size: 20px;
    }

    .meta {
      flex: 1 1 auto;
      min-width: 0;
    }

    .title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .snippet {
      margin: 0 0 6px 0;
      color: #555;
    }

    .author {
      color: #777;
    }

    /* Actions */
    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 16px;
    }
  `]
})
export class ListComponent implements OnInit {
  search = new FormControl('');
  questions: any[] = [];
  total = 0;
  page = 1;
  pageSize = 5;
  isAdmin = false;

  constructor(
    private qs: QuestionService,
    private admin: AdminService,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {}

  async ngOnInit() {
    this.isAdmin = this.checkIsAdminLocal();
    try {
      const ok = await firstValueFrom(this.admin.checkAdmin());
      if (ok) this.isAdmin = true;
    } catch { /* ignore */ }

    this.load();
    this.search.valueChanges.pipe(debounceTime(300))
      .subscribe(() => { this.page = 1; this.load(); });
  }

  load() {
    this.qs.getQuestions(this.search.value || '', this.page, this.pageSize)
      .subscribe((res: any) => {
        this.questions = res.items || [];
        this.total = res.total ?? this.questions.length;
      });
  }

  asUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const rel = path.startsWith('/') ? path : `/${path}`;
    return `${environment.apiOrigin}${rel}`;
  }

  onPage(e: PageEvent) { this.page = e.pageIndex + 1; this.pageSize = e.pageSize; this.load(); }
  onSearchClick() { this.page = 1; this.load(); }

  onDelete(id: string, title: string) {
    if (!this.isAdmin) return;

    const ok = confirm(`Delete this question?\n\n${title}`);
    if (!ok) return;

    this.admin.deleteQuestion(id).subscribe({
      next: () => {
        this.questions = this.questions.filter(q => q.id !== id);
        this.total = Math.max(0, this.total - 1);
        this.snack.open('Question deleted', 'ok', { duration: 1500 });
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          this.isAdmin = false;
          return;
        }
        console.error(err);
        this.snack.open('Failed to delete question', 'ok', { duration: 2000 });
      }
    });
  }

  private checkIsAdminLocal(): boolean {
    try {
      const token = (this.auth as any).currentToken?.() ?? (this.auth as any).currentToken;
      if (!token) return false;
      const payload: any = jwtDecode(token);
      let roleClaim =
        payload?.role ??
        payload?.roles ??
        payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (typeof roleClaim === 'string' && roleClaim.trim().startsWith('[')) {
        try { roleClaim = JSON.parse(roleClaim); } catch { /* ignore */ }
      }
      const roles: string[] = Array.isArray(roleClaim) ? roleClaim : roleClaim ? [roleClaim] : [];
      return roles.map(r => String(r).toLowerCase()).includes('admin');
    } catch { return false; }
  }
}
