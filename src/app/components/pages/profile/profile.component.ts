import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../../services/article.service';
import { S3Service } from '../../../services/s3.service';

interface ProfileData {
  name: string;
  email:string;
  memberSince: string;
  profileImage: string | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  @ViewChild('profilePicInput') profilePicInput!: ElementRef;

  constructor(private _articlService:ArticleService , private _s3service:S3Service){}

  profileData: any = {};

  ngOnInit(): void {
    
    this._articlService.getCurrentUserProfile().subscribe((res:any)=>{
      console.log("current user @ profile",res)

      this.profileData=res.data
    })
  }

  isEditingName = false;
  tempName = this.profileData.name;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  triggerProfilePicUpload(): void {
    this.profilePicInput.nativeElement.click();
  }

  onProfilePicChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }



  saveProfilePic(): void {
    if (this.selectedFile) {
      const fileName = `${Date.now()}_${this.selectedFile.name}`; 
      const fileType = this.selectedFile.type; 
  
   
      this._s3service.generatePresignedurl(fileName, fileType).subscribe(
        (res: any) => {
          const presignedUrl = res.presignedURL;
  
          console.log("Generated presigned URL:", presignedUrl);
  
         
          this._s3service.uploadFileToS33(presignedUrl, this.selectedFile!).subscribe(
            () => {
              console.log('File successfully uploaded to S3');
  
              
              const s3Url = presignedUrl.split('?')[0]; 
              this.profileData.profileImage = s3Url;
  
              
              this._articlService.saveProfileImageToDB(s3Url).subscribe(
                (response: any) => {
                  console.log('Profile picture saved to database', response);
                  this.imagePreview = null; 
                  this.selectedFile = null; 
                },
                (error: any) => {
                  console.error('Error saving profile picture to database', error);
                }
              );
            },
            (error) => {
              console.error('Error uploading file to S3', error);
            }
          );
        },
        (error) => {
          console.error('Error generating presigned URL', error);
        }
      );
    } else {
      console.error('No image selected for upload');
    }
  }
  
  



  cancelProfilePic(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    this.profilePicInput.nativeElement.value = '';
  }

  startEditingName(): void {
    this.isEditingName = true;
    this.tempName = this.profileData.name;
  }

  saveName(): void {
    this.profileData.name = this.tempName;
    
    this._articlService.updateUsername(this.profileData.name).subscribe((res:any)=>{
      console.log("success")
      this.isEditingName = false;
      console.log('Name saved');
    })
    
  }

  cancelNameEdit(): void {
    this.tempName = this.profileData.name;
    this.isEditingName = false;
  }
}
