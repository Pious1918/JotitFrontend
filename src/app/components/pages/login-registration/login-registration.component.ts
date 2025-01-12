import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticleService } from '../../../services/article.service';
import { IloginData, IUser } from '../../../interfaces/user.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-registration',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login-registration.component.html',
  styleUrl: './login-registration.component.css'
})
export class LoginRegistrationComponent {


  isLogin = true;
  loginForm!: FormGroup;
  registerForm!: FormGroup
  errorMessage: string | null = null;

  constructor(private _fb: FormBuilder, private _articleService: ArticleService, private _router: Router) {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    })


    this.registerForm = this._fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^\+?[\d\s-]+$/)]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/[A-Z]/),                
        Validators.pattern(/[!@#$%^&*(),.?":{}|<>]/) 
      ]]})

  }

  toggleForm() {
    this.isLogin = !this.isLogin
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      console.log("Login form submitted", this.loginForm.value)

      const loginData: IloginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      }

      this._articleService.loginUser(loginData).subscribe((res: any) => {
        console.log("response after login", res)

        if (res.success) {
          console.log("Login successfully", res)
          localStorage.setItem('userToken', res.token)
          this._router.navigate(['/'])
        }

      },
        (error) => {
          
          this.errorMessage = error.error.message || 'An error occurred. Please try again.';
        }

      )
    }
  }

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      console.log('Register form submitted', this.registerForm.value)

      const registerData: IUser = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        phone: this.registerForm.value.phone,
        password: this.registerForm.value.password,

      }

      this._articleService.registerUser(registerData).subscribe((res: any) => {
        console.log("response", res)
        this.errorMessage = ''; 
        this.isLogin = true;


      },
        (error) => {
          console.error("Error:", error);
          this.errorMessage = error.error.message || 'An unexpected error occurred';
        }
      )

    }
    this.registerForm.markAllAsTouched();

  }
}
