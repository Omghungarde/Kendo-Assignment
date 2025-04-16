import { Component, OnInit, ViewChild } from '@angular/core';
import { process } from '@progress/kendo-data-query';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ExcelExportComponent, KENDO_EXCELEXPORT } from '@progress/kendo-angular-excel-export';
import { DataBindingDirective, GridComponent, GridDataResult, GridModule } from '@progress/kendo-angular-grid';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import { KENDO_RATING, KENDO_SWITCH, KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { KENDO_CHART, KENDO_SPARKLINE } from '@progress/kendo-angular-charts';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PageChangeEvent } from '@progress/kendo-angular-pager';
import { KENDO_BUTTON, KENDO_SPLITBUTTON } from '@progress/kendo-angular-buttons';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
import { RecordService } from '../../services/lead.service';

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
    KENDO_DIALOG,
    LabelModule,
  ],
  templateUrl: './leadmanagement.component.html',
  styleUrls: ['./leadmanagement.component.css']
})
export class LeadmanagementComponent implements OnInit {
  @ViewChild('excelExport', { static: false }) excelExport: any;

  public listItems: string[] = ['All Leads', 'Pending', 'Completed'];
  public searchPreference: string[] = ['Today\'s Leads', 'Saved 1', 'Custom 2'];
  public gridItems: any[] = [];
  public gridView: GridDataResult = { data: [], total: 0 };
  public pageSize = 10;
  public skip = 0;
  public isNonIntl = false;
  public formGroup!: FormGroup;
  private editedRowIndex: number | null = null;
  private apiUrl = 'http://localhost:3000/gridData';  // API URL for your db.json

  constructor(private fb: FormBuilder, private http: HttpClient,public recordService:RecordService) {}

  ngOnInit(): void {
    this.loadGridData();
  }

  // Fetch data from db.json
  private loadGridData(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.gridItems = data;
        this.updateGridView();
      },
      error: (error) => {
        console.error('Error loading data', error);
      }
    });    
  }

  // Update the gridView based on skip and page size
  private updateGridView(): void {
    this.gridView = {
      data: this.gridItems.slice(this.skip, this.skip + this.pageSize),
      total: this.gridItems.length
    };
  }

  // Pagination handler
  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.updateGridView();
  }

  // Export to Excel functionality
  public exportToExcel(): void {
    this.excelExport.save();
  }

  // Filter data based on search value
  public onFilter(value: string): void {
    const filtered = this.gridItems.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(value.toLowerCase())
      )
    );
    this.gridView = { data: filtered.slice(0, this.pageSize), total: filtered.length };
  }

  // Edit row handler
  public editHandler({ sender, rowIndex, dataItem }: any): void {
    this.closeEditor(sender);

    this.formGroup = this.fb.group({
      RecordID: [dataItem.recordId],
      lastName: [dataItem.lastName, Validators.required],
      firstName: [dataItem.firstName, Validators.required],
      email: [dataItem.email, [Validators.required, Validators.email]],
      phoneType: [dataItem.phoneType],
      leadId: [dataItem.leadId],
      appointmentType: [dataItem.appointmentType],
      bookingAgency: [dataItem.bookingAgency],
      assignedDate: [dataItem.assignedDate],
      salesRep: [dataItem.salesRep],
      coordinator: [dataItem.coordinator],
      syncToMobile: [dataItem.syncToMobile],
      createdSource: [dataItem.createdSource],
      mobileSyncStatus: [dataItem.mobileSyncStatus],
      effectiveDate: [dataItem.effectiveDate],
      validThrough: [dataItem.validThrough],
    });

    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, this.formGroup);
  }

  // Cancel editing
  public cancelHandler({ sender, rowIndex }: any): void {
    this.closeEditor(sender);
  }

  // Save edited item to db.json and update UI
  public saveHandler({ sender, rowIndex, dataItem, formGroup, isNew }: any): void {
    const updatedItem = formGroup.value;

    if (isNew) {
      // For new items, add it to db.json and gridItems
      this.http.post<any>(this.apiUrl, updatedItem).subscribe((newItem) => {
        this.gridItems.push(newItem);
        this.updateGridView();
      }, error => {
        console.error('Error saving new item', error);
      });
    } else {
      // For existing items, update them in db.json and gridItems
      this.http.put<any>(`${this.apiUrl}/${dataItem.id}`, updatedItem).subscribe(() => {
        this.gridItems[rowIndex] = updatedItem;
        this.updateGridView();
      }, error => {
        console.error('Error updating item', error);
      });
    }

    sender.closeRow(rowIndex);
  }

  // Remove item from db.json and UI
  public removeHandler({ dataItem }: any): void {
    this.recordService.deleteRecord(dataItem.id).subscribe(() => {
      // Update the gridItems array by filtering out the removed item
      this.gridItems = this.gridItems.filter(item => item.id !== dataItem.id);
            this.updateGridView();
    }, error => {
      console.error('Error removing item', error);
    });
  }

  // Close the editor after saving or canceling
  private closeEditor(grid: GridComponent): void {
    grid.closeRow(this.editedRowIndex as number);
    this.editedRowIndex = null;
    this.formGroup = this.fb.group({});
  }
}
