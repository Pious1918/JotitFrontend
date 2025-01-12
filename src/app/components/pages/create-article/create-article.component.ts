import { Component, OnDestroy, OnInit } from '@angular/core';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { visibility } from '../../../enums/articleVisibility.enum';
import { io, Socket } from 'socket.io-client';
import { FormsModule } from '@angular/forms';
import { S3Service } from '../../../services/s3.service';
import tinymce from 'tinymce';
import { ArticleService } from '../../../services/article.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-create-article',
  standalone: true,
  imports: [EditorComponent, EditorModule, FormsModule],
  templateUrl: './create-article.component.html',
  styleUrl: './create-article.component.css'
})
export class CreateArticleComponent implements OnInit, OnDestroy {

  constructor(private _s3service: S3Service , private _articleService:ArticleService , private _router:Router) {
    this.socket = io('http://localhost:8000')
  }


  editorContent: string = ''
  visibility: visibility = visibility.PRIVATE
  socket: Socket
  saveTimeout: any;
  selectedFile: File | null = null;  
  preURLSigned!:string

  userId:string=''

  init: EditorComponent['init'] = {
    plugins: 'lists link image table code help wordcount fullscreen',
    toolbar: 'undo redo | bold italic | link image | alignleft aligncenter alignright | fullscreen code',
    external_plugins: {
      fullscreen: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/plugins/fullscreen/plugin.min.js',
    },
    height: '96vh', 
    file_picker_callback: (callback, value, meta) => {
      if (meta['filetype'] === 'image') {
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
    
    setup: (editor) => {

      editor.on('init', () => {
        console.log('Editor initialized');
      });



      editor.on('FullscreenStateChanged', (e) => {
        if (e.state) {
          document.body.classList.add('tinymce-fullscreen');
        } else {
          document.body.classList.remove('tinymce-fullscreen');
        }
      });


      editor.on('keyup', () => {
        this.editorContent = editor.getContent()
        this.onEditorContentChange();
      })

     
      editor.on('change', () => {
        this.editorContent = editor.getContent();
        this.onEditorContentChange();
      });

    },
  };





  ngOnInit(): void {


    console.log("hai piois")
    this.socket.on('draft-saved', (data) => {
      console.log("Draft saved successfully", data);
    })
  }




  ngAfterViewInit(){
    this._articleService.getCurrentUserProfile().subscribe((res:any)=>{
      console.log("current user details are",res)
      this.userId = res.data._id
      console.log("userdidd",this.userId)
    })
  }

  

  onEditorContentChange() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveDraft()
    }, 1000)
  }


  saveDraft() {
    console.log("Iam saving the draft", this.editorContent)
    console.log("userdidd",this.userId)

    const data = {
      userId:this.userId,
      content: this.editorContent,
      images: this.extractImageurl(this.editorContent),
      visibility: this.visibility
    }

    this.socket.emit('save-draft', data)
  }


  extractImageurl(content: string): string[] {
    const imageRegex = /<img[^>]+src="([^">]+)"/g;

    const urls: string[] = [];
    let match;
    while ((match = imageRegex.exec(content)) !== null) {
      urls.push(match[1]);
    }
    return urls;
  }



  publishArticle() {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to publish this article?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, publish it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.visibility = visibility.PUBLIC;
        this.saveDraft(); 
        this._router.navigate(['/stories']);
        
        Swal.fire('Published!', 'Your article has been published.', 'success');
      } else {
        Swal.fire('Cancelled', 'Your article was not published.', 'error');
      }
    });
  }
  


  hasContent(): boolean {
    if (!this.editorContent) return false;
    const textContent = this.editorContent.replace(/<[^>]*>/g, '').trim();
    const hasImages = this.extractImageurl(this.editorContent).length > 0;
    return textContent.length > 0 || hasImages;
  }


  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect()
      console.log("socket disconnected")
    }
    this.editorContent = ''; 
    this.visibility = visibility.PRIVATE; 
  }





}
