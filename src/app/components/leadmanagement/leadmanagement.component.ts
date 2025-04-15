import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ExcelExportComponent, KENDO_EXCELEXPORT } from '@progress/kendo-angular-excel-export';
import { DataBindingDirective, GridDataResult, GridModule } from '@progress/kendo-angular-grid';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import { KENDO_RATING, KENDO_SWITCH, KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { KENDO_CHART, KENDO_SPARKLINE } from '@progress/kendo-angular-charts';
import { CommonModule } from '@angular/common';

import { gridData } from '../../employees';
import { images } from '../../images';
import { products } from '../../product';
import { Product } from '../../model';
import { PageChangeEvent } from '@progress/kendo-angular-pager';
import { aggregateBy, AggregateDescriptor, AggregateResult, process } from '@progress/kendo-data-query';
import { Group } from '@progress/kendo-drawing';
import { KENDO_BUTTON, KENDO_SPLITBUTTON } from '@progress/kendo-angular-buttons';

@Component({
  selector: 'app-leadmanagement',
  standalone: true,
  imports: [
    CommonModule,
    GridModule,
    ReactiveFormsModule,
    ExcelExportComponent,
    KENDO_EXCELEXPORT,
    KENDO_DROPDOWNLIST,
    KENDO_TEXTBOX,
    KENDO_SWITCH,
    KENDO_CHART,
    KENDO_SPARKLINE,
    KENDO_RATING,
    KENDO_BUTTON,
    KENDO_SPLITBUTTON,
    LabelModule
  ],
  templateUrl: './leadmanagement.component.html',
  styleUrl: './leadmanagement.component.css'
})
export class LeadmanagementComponent implements OnInit {
  public gridItems: any[] = [];
  public formGroup!: FormGroup;
  public editedRowIndex: number | null = null;
  public originalData: any[] = [];
  public gridView!: GridDataResult;
  @ViewChild('excelExport', { static: false }) excelExport!: ExcelExportComponent;

  public exportToExcel(): void {
    this.excelExport.save();
  }

  @ViewChild(DataBindingDirective) dataBinding!: DataBindingDirective;

  public listItems: Array<string> = ['Lead 1', 'Lead 2', 'Lead 3'];
  public searchPreference: Array<string> = ['Search 1', 'Search 2', 'Search 3'];
  public isNonIntl: boolean = false;

  constructor(private fb: FormBuilder) { }
  public pageSize = 7;
  public skip = 0;


  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadItems();
  }

  private loadItems(): void {
    this.gridView = {
      data: this.gridItems.slice(this.skip, this.skip + this.pageSize),
      total: this.gridItems.length
    };
  }
  ngOnInit(): void {
    this.loadItems();
    this.gridItems = [...gridData];       // initialize display data
    this.originalData = [...gridData];    // preserve original data for search
  }

  public onFilter(searchValue: string): void {
    const lowerValue = searchValue.toLowerCase();

    this.gridItems = this.originalData.filter(item =>
      Object.values(item).some(value =>
        value != null && value.toString().toLowerCase().includes(lowerValue)
      )
    );
  }

  public createFormGroup(dataItem: any): FormGroup {
    return this.fb.group({
      lastName: [dataItem.lastName, Validators.required],
      firstName: [dataItem.firstName, Validators.required],
      email: [dataItem.email, Validators.required],
      phoneType: [dataItem.phoneType],
      leadId: [dataItem.leadId],
      appointmentType: [dataItem.appointmentType],
      bookingAgency: [dataItem.bookingAgency],
      assignedDate: [dataItem.assignedDate],
      salesRep: [dataItem.salesRep],

    });
  }

  public editHandler({ sender, rowIndex, dataItem }: any): void {
    this.closeEditor(sender);
    this.formGroup = this.createFormGroup(dataItem);
    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({ sender, rowIndex }: any): void {
    sender.closeRow(rowIndex);
    this.editedRowIndex = null;
  }

  public saveHandler({ sender, rowIndex, formGroup, dataItem }: any): void {
    const updatedItem = formGroup.value;
    this.gridItems[rowIndex + this.skip] = { ...dataItem, ...updatedItem };
    this.gridItems = [...this.gridItems];
    this.loadItems(); // update the view
    sender.closeRow(rowIndex);
  }

  public removeHandler({ dataItem }: any): void {
    const index = this.gridItems.indexOf(dataItem);
    if (index >= 0) {
      this.gridItems.splice(index, 1);
      this.originalData.splice(index, 1);
    }
  }

  private closeEditor(grid: any): void {
    if (this.editedRowIndex !== null) {
      grid.closeRow(this.editedRowIndex);
      this.editedRowIndex = null;
    }
  }
}