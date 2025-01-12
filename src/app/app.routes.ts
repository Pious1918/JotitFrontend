import { Routes } from '@angular/router';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { CreateArticleComponent } from './components/pages/create-article/create-article.component';
import { LoginRegistrationComponent } from './components/pages/login-registration/login-registration.component';
import { AuthService } from './services/auth.service';
import { ProfileComponent } from './components/pages/profile/profile.component';
import { YourStoriesComponent } from './components/pages/your-stories/your-stories.component';
import { EditstoryComponent } from './components/pages/editstory/editstory.component';
import { ShowstoryComponent } from './components/pages/showstory/showstory.component';

export const routes: Routes = [


    {path:'' , component:DashboardComponent ,canActivate:[AuthService]},
    {path:'composearticle', component:CreateArticleComponent , canActivate:[AuthService]},
    {path:'profile', component:ProfileComponent , canActivate:[AuthService]},
    {path:'stories', component:YourStoriesComponent , canActivate:[AuthService]},
    {path:'editstory/:id', component:EditstoryComponent , canActivate:[AuthService]},
    {path: 'article/:id', component: ShowstoryComponent, canActivate:[AuthService] },
    {path:'login', component:LoginRegistrationComponent}

    

];
