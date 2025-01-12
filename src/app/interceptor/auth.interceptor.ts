import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  if(req.url.includes('amazonaws.com')){
    console.log("reached @ interceptor")
    return next(req)
  }


  const userToken:string =localStorage.getItem('userToken')??"";
 
//  if(!userToken){
//   return next(req)
//  }

const authReq=req.clone({
  headers:req.headers.set('Authorization',`Bearer ${userToken}`)
})

  return next(authReq);
};
