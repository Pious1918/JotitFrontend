import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../common/header/header.component';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../../services/article.service';
import { RouterModule } from '@angular/router';

interface Article {
  _id: number;
  userId:any;
  title: string;
  excerpt: string;
  heading: string;
  authorName: string;
  authorImage: string;
  createdAt: Date;
  readingTime: number;
  category: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{


  constructor(private _articleService:ArticleService){}


  articles: Article[] = [
 
  ];

  currentPage = 1;
  totalPages = 5;
  limit:number = 5
  pages: number[] = [];

  ngOnInit() {


    this.getAllArticles(this.currentPage)

    console.log("hai pios")
    this.pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
  }



  getAllArticles(page:number){
    this._articleService.getAllArticles(page , this.limit ).subscribe((res:any)=>{
      console.log("List of all articles are ::",res)

      if (res.success && res.data) {
        this.articles = res.data.map((story: any) => ({
          ...story,
          heading: this.stripHtml(story.content), 
          imageSrc: this.extractImageSrc(story.content), 

          excerpt: this.stripHtml(story.content).replace(/<[^>]+>/g, '').slice(0, 100), 
          date: story.createdAt ? new Date(story.createdAt) : null, 
          status: "Published"
        }));

        
        this.articles = this.articles;
      } else {
        console.error('Failed to fetch stories:', res.message);
      }

    })
  }


  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
  
    
    const headings = div.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let extractedHtml = '';
  
    headings.forEach((heading) => {
      extractedHtml += heading.outerHTML; 
    });
  
    return extractedHtml || div.innerText || ''; 
  }
  

  extractImageSrc(html: string): string | null {
    const div = document.createElement('div');
    div.innerHTML = html;
  
    const img = div.querySelector('img'); 
    return img ? img.src : null; 
  }

  
  onPageChange(page: number) {
    this.currentPage = page;
  }

  changePage(page: number): void {
    console.log("hai from change page")
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.getAllArticles(page);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }



  
}
