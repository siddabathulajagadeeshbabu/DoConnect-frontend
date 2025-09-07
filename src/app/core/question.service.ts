//src/app/core/question.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ----------------- DTOs -----------------

export interface QuestionDto {
  id: string;
  title: string;
  text: string;
  author?: string;
  createdAt?: string;
  status?: string;
  images?: string[];   // file paths
}

export interface AnswerDto {
  id: string;
  text: string;
  author?: string;
  createdAt?: string;
  status?: string;
  images?: string[];
}

export interface CreateQuestionDto {
  title: string;
  body: string;
}

// ----------------- Service -----------------

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private api = `${environment.apiUrl}/questions`;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of questions
   */
  getQuestions(search = '', page = 1, pageSize = 20): Observable<{ items: QuestionDto[]; total: number }> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('q', search);
    }

    return this.http.get<{ items: QuestionDto[]; total: number }>(this.api, { params });
  }

  /**
   * Get single question by id
   */
  getQuestion(id: string): Observable<QuestionDto> {
    return this.http.get<QuestionDto>(`${this.api}/${id}`);
  }

  /**
   * Create a new question (multipart form with files)
   */
  createQuestion(dto: CreateQuestionDto, files?: File[]): Observable<QuestionDto> {
    const fd = new FormData();
    fd.append('Title', dto.title);
    fd.append('Text', dto.body);

    if (files && files.length > 0) {
      files.forEach(f => fd.append('Files', f, f.name));
    }

    return this.http.post<QuestionDto>(this.api, fd);
  }

  /**
   * Get answers for a given question
   */
  getAnswers(questionId: string): Observable<AnswerDto[]> {
    return this.http.get<AnswerDto[]>(`${this.api}/${questionId}/answers`);
  }

  /**
   * Post an answer with optional images
   */
  postAnswer(questionId: string, formData: FormData): Observable<AnswerDto> {
    return this.http.post<AnswerDto>(`${this.api}/${questionId}/answers`, formData);
  }

  /**
   * Convenience helper: build answer form data
   */
  buildAnswerForm(text: string, files?: File[]): FormData {
    const fd = new FormData();
    fd.append('Text', text);

    if (files && files.length > 0) {
      files.forEach(f => fd.append('Files', f, f.name));
    }

    return fd;
  }
}
