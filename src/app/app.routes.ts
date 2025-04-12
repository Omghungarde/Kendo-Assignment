import { Routes } from '@angular/router';
import { LeadmanagementComponent } from './components/leadmanagement/leadmanagement.component';
import { NavbarComponent } from './navbar/navbar.component';
import { UiComponent } from './ui/ui.component';

export const routes: Routes = [
    {path:'',component:NavbarComponent,
        children:[
            {path:'ui',component:UiComponent,},
            {path:'',redirectTo:'ui',pathMatch:'full'}
        ]
    },

    


];
