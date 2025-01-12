import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IloginData, IUser } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {


  private articleurl= 'http://localhost:8000'
  constructor(private _http:HttpClient) { }

  getArticlewithId(){
    return this._http.get(`${this.articleurl}/userarticles`)
  }

  registerUser(registerData:IUser){
    return this._http.post(`${this.articleurl}/registeruser` ,{registerData})
  }

  loginUser(loginData:IloginData){
    return this._http.post(`${this.articleurl}/login`,{loginData})
  }

  getCurrentUserProfile(){
    return this._http.get(`${this.articleurl}/getuserdetails`)
  }

  getPublisheduserStories(){
    return this._http.get(`${this.articleurl}/userPublished`)
  }

  getDrafteduserStories(){
    return this._http.get(`${this.articleurl}/userDraft`)
  }

  getAllArticles(page:number , limit:number){
    return this._http.get(`${this.articleurl}/allarticles?page=${page}&limit=${limit}`)
  }

  getStoryById(id:string){
    return this._http.get(`${this.articleurl}/stories/:${id}`)
  }

  updateStory(storyid:string , content:any){
    return this._http.post(`${this.articleurl}/updatearticle`,{storyid , content})
  }


  saveDraft(storyid:string , content:any){
    return this._http.post(`${this.articleurl}/savedraft`,{storyid , content})
  }

  deletestory(storyId:string){
    return this._http.delete(`${this.articleurl}/delete/:${storyId}`)
  }

  saveProfileImageToDB(s3Url:string){
    return this._http.put(`${this.articleurl}/upateImage`,{s3Url})
  }

  updateUsername(name:string){
    console.log("naeme is ",name)
    return this._http.put(`${this.articleurl}/updatename`,{name})
  }

}
