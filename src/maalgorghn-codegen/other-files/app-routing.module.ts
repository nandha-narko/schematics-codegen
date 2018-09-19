import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
      path: '',
      redirectTo: '/rate-quote',
      pathMatch: 'full'
    },
    {
      path: 'rate-quote',
      loadChildren: 'app/rate-quote/rate-quote.module#RateQuoteModule'
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }