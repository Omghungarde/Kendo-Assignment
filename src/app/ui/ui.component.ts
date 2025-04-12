import { Component } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { sampleProducts } from '../product';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { NavbarComponent } from "../navbar/navbar.component";
import { KENDO_TABSTRIP } from '@progress/kendo-angular-layout';
import { LeadmanagementComponent } from "../components/leadmanagement/leadmanagement.component";
@Component({
  selector: 'app-ui',
  imports: [GridModule, ButtonModule, KENDO_TABSTRIP, LeadmanagementComponent],
  templateUrl: './ui.component.html',
  styleUrl: './ui.component.css'
})
export class UiComponent {
  public gridData = sampleProducts;
  
}