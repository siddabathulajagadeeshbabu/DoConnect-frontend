// src/app/features/questions/ask/ask.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuestionService } from '../../../core/question.service';

@Component({
  selector: 'app-ask',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './ask.component.html',
  styleUrls: ['./ask.component.scss']
})
export class AskComponent implements OnInit {
  f!: FormGroup;
  files: File[] = [];

  constructor(
    private fb: FormBuilder,
    private qs: QuestionService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.f = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  onFiles(event: any) {
    this.files = Array.from(event.target.files);
  }

  submit() {
    if (this.f.invalid) {
      this.snack.open('Please fill in all required fields', 'Close', { duration: 2500 });
      return;
    }

    this.qs.createQuestion(this.f.value, this.files).subscribe({
      next: () => {
        this.snack.open('Question posted successfully!', 'Close', { duration: 2500 });
        this.f.reset();
        this.files = [];
      },
      error: () => {
        this.snack.open('Failed to post question. Try again.', 'Close', { duration: 3000 });
      }
    });
  }
}




