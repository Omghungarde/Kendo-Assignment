import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import { ExcelExportComponent, KENDO_EXCELEXPORT } from '@progress/kendo-angular-excel-export';
import { CreateFormGroupArgs, DataBindingDirective, KENDO_GRID } from '@progress/kendo-angular-grid';
import { KENDO_RATING, KENDO_SWITCH, KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { KENDO_CHART, KENDO_SPARKLINE } from '@progress/kendo-angular-charts';
import { CommonModule } from '@angular/common';
import { gridData } from '../../employees';
import { GridModule } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-leadmanagement',
  standalone: true,
  imports: [
    ExcelExportComponent, KENDO_EXCELEXPORT, KENDO_DROPDOWNLIST, LabelModule,
    KENDO_SWITCH, KENDO_GRID, KENDO_TEXTBOX, KENDO_CHART, KENDO_SPARKLINE,
    KENDO_RATING, ReactiveFormsModule, GridModule, CommonModule
  ],
  templateUrl: './leadmanagement.component.html',
  styleUrl: './leadmanagement.component.css'
})
export class LeadmanagementComponent implements OnInit {
  public originalData: any[] = [];
  public gridData: any[] = [];
  public gridItems: any[] = [];
  public gridView: any[] = [];

  public formGroup!: FormGroup;
  public editedRowIndex: number | null = null;
  public isNonIntl: boolean = false;

  @ViewChild(DataBindingDirective) dataBinding!: DataBindingDirective;

  public listItems: Array<string> = ["Lead 1", "Lead 2", "Lead 3"];
  public searchPreference: Array<string> = ["Search 1", "Search 2", "Search 3"];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.originalData = [...gridData];
    this.gridData = [...gridData];
    this.gridItems = [...gridData];
    this.gridView = [...gridData];
  }

  public onFilter(searchValue: string): void {
    const lowerValue = searchValue.toLowerCase();

    this.gridView = this.originalData.filter(item =>
      Object.values(item).some(value =>
        value != null && value.toString().toLowerCase().includes(lowerValue)
      )
    );
  }

  public createFormGroup(args: CreateFormGroupArgs): FormGroup {
    const item = args.dataItem;

    return this.fb.group({
      lastName: [item.lastName, Validators.required],
      firstName: [item.firstName, Validators.required],
      email: [item.email, Validators.required],
      phoneType: [item.phoneType],
      leadId: [item.leadId],
    });
  }

  public editHandler({ sender, rowIndex, dataItem }: any): void {
    this.closeEditor(sender);
    this.formGroup = this.createFormGroup({ dataItem, isNew: false, rowIndex, sender });
    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({ sender, rowIndex }: any): void {
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup }: any): void {
    this.gridData[rowIndex] = formGroup.value;
    this.originalData[rowIndex] = formGroup.value;
    sender.closeRow(rowIndex);
    this.editedRowIndex = null;
    this.gridView = [...this.gridData];
  }

  public removeHandler({ dataItem }: any): void {
    const index = this.gridData.indexOf(dataItem);
    if (index >= 0) {
      this.gridData.splice(index, 1);
      this.originalData.splice(index, 1);
      this.gridView = [...this.gridData];
    }
  }

  private closeEditor(grid: any, rowIndex: number = this.editedRowIndex!): void {
    grid.closeRow(rowIndex);
    this.editedRowIndex = null;
  }
}
