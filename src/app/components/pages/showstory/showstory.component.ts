import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-showstory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './showstory.component.html',
  styleUrl: './showstory.component.css'
})
export class ShowstoryComponent implements OnInit{

  articleId!: string;
  article: any;
  authorName:string=''
  profilepic:string=''

  constructor(
    private _route: ActivatedRoute,
    private _articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.articleId = this._route.snapshot.paramMap.get('id')!;

    console.log("arrticle idd",this.articleId)

    this._articleService.getStoryById(this.articleId).subscribe((res:any)=>{
      console.log("articl",res)
      this.article =res.data
      this.authorName=res.data.userId.name
      this.profilepic=res.data.userId.profileImage
      console.log("dddd",this.article)
    })
  }
}
