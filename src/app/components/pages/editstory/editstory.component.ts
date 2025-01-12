import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { S3Service } from '../../../services/s3.service';
import tinymce from 'tinymce';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editstory',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule, EditorComponent],
  templateUrl: './editstory.component.html',
  styleUrl: './editstory.component.css'
})
export class EditstoryComponent implements OnInit {
  storyId: string | null = null;
  storyContent: string = '';
  visibility: string = ''
  init: any; 
  preURLSigned!:string

  constructor(
    private _route: ActivatedRoute, private _router: Router,
    private _articleService: ArticleService,
    private _s3service:S3Service
  ) { }

  ngOnInit(): void {

    this.storyId = this._route.snapshot.paramMap.get('id')
    console.log("story id ", this.storyId)

    if (this.storyId) {
      this.loadStory(this.storyId)
    }

    


    this.init = {
      plugins: 'lists link image table code help wordcount fullscreen',
      toolbar: 'undo redo | bold italic | link image | alignleft aligncenter alignright | fullscreen code',
      external_plugins: {
        fullscreen: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/plugins/fullscreen/plugin.min.js',
      },
      height: 500,
      file_picker_callback: (callback: any, value: any, meta: any) => {
        if (meta.filetype === 'image') {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');

          input.onchange = () => {
            const file = input.files?.[0];
            if (file) {
              const fileName = `${Date.now()}_${file.name}`;
              const fileType = file.type;
      
             
              this._s3service.generatePresignedurl(fileName, fileType).subscribe((res: any) => {
                this.preURLSigned = res.presignedURL;
      
              
                this._s3service.uploadFileToS33(res.presignedURL, file).subscribe((uploadRes: any) => {
                 
                  const s3fileURL = this.preURLSigned.split('?')[0];
      
                 
                  const editor = tinymce?.activeEditor;
                  if (!editor) {
                    console.error('TinyMCE editor is not active or initialized');
                    return;
                  }
      
                  const tempImageId = `image-${Date.now()}`; 
                  const tempImage = new Image();
                  tempImage.src = s3fileURL; 
      
                 
                  tempImage.onload = () => {
                    const imgElement = editor.getDoc().createElement('img');
                    imgElement.src = s3fileURL; 
                    imgElement.alt = file.name;
                    imgElement.id = tempImageId;
      
                    
                    editor.selection.setContent(`<img src="${s3fileURL}" alt="${file.name}" id="${tempImageId}" />`);
                  };
                });
              });
            }
          };

          input.click();
        }
      },
    };

  }


  loadStory(id: string) {
    this._articleService.getStoryById(id).subscribe((res: any) => {
      if (res.success && res.data) {
        console.log("res from edit", res)
        this.storyContent = res.data.content; 
        this.visibility = res.data.visibility; 
      }
    })
  }

  saveStory(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this story?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
       
        if (this.storyId) {
          this._articleService.updateStory(this.storyId, this.storyContent).subscribe(
            (res: any) => {
              if (res.success) {
                Swal.fire('Success', 'Story has been saved successfully.', 'success');
                this._router.navigate(['/stories']);
              }
            },
            (error) => {
              Swal.fire('Error', 'Failed to save the story.', 'error');
              console.error('Failed to update story:', error);
            }
          );
        }
      } else {
        
        Swal.fire('Canceled', 'Your story has not been saved.', 'info');
      }
    });
  }


  saveAndPublishDraft() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You are about to make your draft public.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, make it public!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        
        if (this.storyId) {
          this._articleService.saveDraft(this.storyId, this.storyContent).subscribe(
            (res: any) => {
              if (res.success) {
                Swal.fire('Success', 'Your draft has been made public!', 'success');
                this._router.navigate(['/stories']);
              }
            },
            (error) => {
              Swal.fire('Error', 'Failed to update the story.', 'error');
              console.error('Failed to update story:', error);
            }
          );
        }
      } else {
     
        Swal.fire('Canceled', 'Your draft remains private.', 'info');
      }
    });
  }


}
