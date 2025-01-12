import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  isMenuOpen = false;
  isSidebarOpen = false;
  userId: string = ''
  profileImage: string = ''
  name: string = ''
  constructor(private _router: Router, private _articleService: ArticleService) { }


  ngOnInit(): void {
    this._articleService.getCurrentUserProfile().subscribe((res: any) => {
      console.log("current user details are from header", res)
      this.userId = res.data._id
      this.profileImage = res.data.profileImage
      this.name = res.data.name
      console.log("userdidd", this.userId)
    })
  }


  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isMenuOpen && this.isSidebarOpen) {
      this.isMenuOpen = false;
    }
  }



  signOut() {

    Swal.fire({
      title: 'Are you sure want to Logout?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!',
      cancelButtonText: 'No, stay logged in'
    }).then((result) => {

      if (result.isConfirmed) {
        localStorage.removeItem('userToken')
        this.isSidebarOpen = false;
        this._router.navigate(['/login']);
        Swal.fire(
          'Logged Out!',
          'You have successfully logged out.',
          'success'
        )
      }
    })
    
  }

}
