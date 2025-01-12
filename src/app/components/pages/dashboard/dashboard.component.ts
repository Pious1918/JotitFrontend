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
          heading: this.stripHtml(story.content), // Extract heading with styles
          imageSrc: this.extractImageSrc(story.content), // Extract image src

          excerpt: this.stripHtml(story.content).replace(/<[^>]+>/g, '').slice(0, 100), // Extract plain text for excerpt
          date: story.createdAt ? new Date(story.createdAt) : null, // Convert to Date object if present
          status: "Published"
        }));

        // Set displayed stories to published stories by default
        this.articles = this.articles;
      } else {
        console.error('Failed to fetch stories:', res.message);
      }

    })
  }


  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
  
    // Extract heading tags with styles
    const headings = div.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let extractedHtml = '';
  
    headings.forEach((heading) => {
      extractedHtml += heading.outerHTML; // Include the HTML of heading tags
    });
  
    return extractedHtml || div.innerText || ''; // Fallback to plain text if no headings found
  }
  

  extractImageSrc(html: string): string | null {
    const div = document.createElement('div');
    div.innerHTML = html;
  
    const img = div.querySelector('img'); // Find the first image tag
    return img ? img.src : null; // Return the src attribute or null if no image
  }

  // Pagination methods
  onPageChange(page: number) {
    this.currentPage = page;
    // Implement your pagination logic here
    // This would typically involve calling your backend API
    // with the new page number
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
