import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-your-stories',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './your-stories.component.html',
  styleUrl: './your-stories.component.css'
})
export class YourStoriesComponent implements OnInit {

  activeTab: 'published' | 'drafts' = 'published';

  publishedStories: any = [];

  displayeddStories: any[] = [];


  draftStories: any = [];

  get displayedStories(): any {
    return this.activeTab === 'published' ? this.publishedStories : this.draftStories;
  }

  constructor(private _articleService: ArticleService, private _router: Router) { }

  ngOnInit(): void {

    this.getPublishedstories()

  }

  ngAfterViewInit() {
    this.getDraftedStories()
  }

  getPublishedstories() {

    this._articleService.getPublisheduserStories().subscribe((res: any) => {
      console.log("user Published stories ", res)

      if (res.success && res.data) {
        this.publishedStories = res.data.map((story: any) => ({
          ...story,
          heading: this.stripHtml(story.content), 
          imageSrc: this.extractImageSrc(story.content), 

          excerpt: this.stripHtml(story.content).replace(/<[^>]+>/g, '').slice(0, 100), 
          date: story.date ? new Date(story.date) : null, 
          status: "Published"
        }));

        
        this.displayeddStories = this.publishedStories;
      } else {
        console.error('Failed to fetch stories:', res.message);
      }
    })

  }


  getDraftedStories() {
    this._articleService.getDrafteduserStories().subscribe((res: any) => {
      if (res.success && res.data) {
        this.draftStories = res.data.map((story: any) => ({
          ...story,
          heading: this.stripHtml(story.content), 
          imageSrc: this.extractImageSrc(story.content), 

          excerpt: this.stripHtml(story.content).replace(/<[^>]+>/g, '').slice(0, 100), 
          date: story.createdAt ? new Date(story.date) : null, 
          status: "draft"
        }));

        
        this.displayeddStories = this.publishedStories;
      } else {
        console.error('Failed to fetch stories:', res.message);
      }
    })
  }

  setActiveTab(tab: 'published' | 'drafts'): void {
    this.activeTab = tab;
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



  deleteStory(storyId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._articleService.deletestory(storyId).subscribe(
          (res: any) => {
            console.log("Story deleted: ", res);
        
            this.getPublishedstories(); 
            this.getDraftedStories()
            Swal.fire('Deleted!', 'Your story has been deleted.', 'success');
          },
          (error) => {
            console.error("Error deleting story: ", error);
            Swal.fire('Error!', 'There was a problem deleting your story.', 'error');
          }
        );
      }
    });
  }
  

  editStory(storyId: string): void {

    console.log("story id from edit", storyId)

    this._router.navigate(['/editstory', storyId])

  }


}
