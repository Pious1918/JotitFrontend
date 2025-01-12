import { Component, OnDestroy, OnInit } from '@angular/core';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { visibility } from '../../../enums/articleVisibility.enum';
import { io, Socket } from 'socket.io-client';
import { FormsModule } from '@angular/forms';
import { S3Service } from '../../../services/s3.service';
import tinymce from 'tinymce';
import { ArticleService } from '../../../services/article.service';

@Component({
  selector: 'app-create-article',
  standalone: true,
  imports: [EditorComponent, EditorModule, FormsModule],
  templateUrl: './create-article.component.html',
  styleUrl: './create-article.component.css'
})
export class CreateArticleComponent implements OnInit, OnDestroy {

  constructor(private _s3service: S3Service , private _articleService:ArticleService) {
    this.socket = io('http://localhost:8000')
  }


  editorContent: string = ''
  visibility: visibility = visibility.PRIVATE
  socket: Socket
  saveTimeout: any;
  selectedFile: File | null = null;  // to store the actual file for uploading
  preURLSigned!:string

  userId:string=''

  init: EditorComponent['init'] = {
    plugins: 'lists link image table code help wordcount fullscreen',
    toolbar: 'undo redo | bold italic | link image | alignleft aligncenter alignright | fullscreen code',
    external_plugins: {
      fullscreen: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/plugins/fullscreen/plugin.min.js',
    },
    height: '96vh', // Set the height of the editor dynamically
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
    
            // Instead of previewing as base64, just call the presigned URL service
            this._s3service.generatePresignedurl(fileName, fileType).subscribe((res: any) => {
              this.preURLSigned = res.presignedURL;
    
              // Upload the file to S3
              this._s3service.uploadFileToS33(res.presignedURL, file).subscribe((uploadRes: any) => {
                // Get the S3 URL after the file is uploaded
                const s3fileURL = this.preURLSigned.split('?')[0];
    
                // Now, handle the image preview after successful upload
                const editor = tinymce?.activeEditor;
                if (!editor) {
                  console.error('TinyMCE editor is not active or initialized');
                  return;
                }
    
                const tempImageId = `image-${Date.now()}`; // Temporary ID for the image
                const tempImage = new Image();
                tempImage.src = s3fileURL; // Set the final S3 URL as the image source
    
                // Wait for the image to load before updating the editor
                tempImage.onload = () => {
                  const imgElement = editor.getDoc().createElement('img');
                  imgElement.src = s3fileURL; // Set the image src to the S3 URL
                  imgElement.alt = file.name;
                  imgElement.id = tempImageId; // Assign the temporary image ID
    
                  // Insert the image into the editor
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

      // Listen for change events (any content modification)
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
    this.visibility = visibility.PUBLIC
    this.saveDraft()
  }
  hasContent(): boolean {
    if (!this.editorContent) return false;
    // Remove HTML tags and check if there's actual content
    const textContent = this.editorContent.replace(/<[^>]*>/g, '').trim();
    const hasImages = this.extractImageurl(this.editorContent).length > 0;
    return textContent.length > 0 || hasImages;
  }


  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect()
      console.log("socket disconnected")
    }
    this.editorContent = ''; // Clear editor content
    this.visibility = visibility.PRIVATE; // Reset visibility
  }





}
