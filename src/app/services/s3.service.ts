import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class S3Service {

  private articleurl= 'https://jotitbackend-1.onrender.com'
  constructor(private _http:HttpClient) { }

  generatePresignedurl(fileName:string , fileType:string):Observable<{presignedUrl:string}>{
    return this._http.post<{presignedUrl:string}>(`${this.articleurl}/generatepresigned`,{fileName , fileType})
  }


  uploadFileToS33(url: string, file: File) {
    console.log("at seeee")
    console.log("File type:", file.type);

    return this._http.put(url, file, {
      headers: { 'Content-Type': file.type },
    });
  }

  uploadFileToS333(url: string, file: File) {
    if (!file) {
      console.error("File is not provided for upload.");
      return;
    }
  
    const contentType = file.type || 'application/octet-stream'; // Fallback for missing file.type
    console.log("Uploading file to S3:", file.name, "with type:", contentType);
  
    return this._http.put(url, file, {
      headers: { 'Content-Type': contentType },
    });
  }
  


}
