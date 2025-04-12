import { Component } from '@angular/core';
import { NgModel } from '@angular/forms';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import { ExcelExportComponent, KENDO_EXCELEXPORT } from '@progress/kendo-angular-excel-export';
import { KENDO_SWITCH } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
@Component({
  selector: 'app-leadmanagement',
  imports: [ExcelExportComponent,KENDO_EXCELEXPORT,KENDO_DROPDOWNLIST,LabelModule,KENDO_SWITCH],
  templateUrl: './leadmanagement.component.html',
  styleUrl: './leadmanagement.component.css'
})
export class LeadmanagementComponent {
  public listItems: Array<string> = [
    "Baseball",
    "Basketball",
    "Cricket",
    "Field Hockey",
    "Football",
    "Table Tennis",
    "Tennis",
    "Volleyball",
  ];
}
