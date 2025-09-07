//src/app/features/about/about.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="about-container">
      <mat-card class="about-card">
        <h2>About 🚀 DOConnect</h2>
        <p>
          <strong>DOConnect</strong> is a collaborative Q&A platform where users
          can ask, share, and explore questions across various domains.
        </p>
        <p>
          The platform encourages learning and knowledge-sharing with an
          easy-to-use interface, powerful search, and community-driven content.
        </p>
        <p>
          Whether you are a student, developer, or enthusiast, DOConnect is here
          to help you connect, learn, and grow.
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .about-container {
      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
    }

    .about-card {
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      background: #fff;
    }

    h2 {
      margin-bottom: 16px;
      color: #1976d2;
      font-weight: 600;
      font-size: 1.6rem;
    }

    p {
      font-size: large;
      line-height: 1.6;
      color: #444;
      margin-bottom: 12px;
    }
  `]
})
export class AboutComponent {}
