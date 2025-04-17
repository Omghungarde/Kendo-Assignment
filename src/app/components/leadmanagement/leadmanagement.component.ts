import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, NgModel, FormsModule } from '@angular/forms';
import { GridDataResult, GridComponent, PageChangeEvent, GridModule } from '@progress/kendo-angular-grid';
import { ExcelExportComponent, KENDO_EXCELEXPORT } from '@progress/kendo-angular-excel-export';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { KENDO_BUTTON, KENDO_SPLITBUTTON } from '@progress/kendo-angular-buttons';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import { KENDO_RATING, KENDO_SWITCH, KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { KENDO_CHART, KENDO_SPARKLINE } from '@progress/kendo-angular-charts';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
import { RecordService } from '../../services/lead.service';
import { orderBy, SortDescriptor } from '@progress/kendo-data-query';

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
    FormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './leadmanagement.component.html',
  styleUrls: ['./leadmanagement.component.css']
})
export class LeadmanagementComponent implements OnInit {
  @ViewChild('excelExport', { static: false }) excelExport!: ExcelExportComponent;
  @ViewChild(GridComponent) grid!: GridComponent;

  public listItems: string[] = ['All Leads', 'Pending', 'Completed'];
  public searchPreference: string[] = ['Today\'s Leads', 'Saved 1', 'Custom 2'];
  public gridItems: any[] = [];
  public gridView: GridDataResult = { data: [], total: 0 };
  public pageSize = 10;
  public skip = 0;

  public formGroup!: FormGroup;
  private editedRowIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public recordService: RecordService
  ) {}

  ngOnInit(): void {
    this.loadGridData();
  }
  public sort: SortDescriptor[] = [];

  public onSortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.gridItems = orderBy(this.gridItems, sort);
  }
  private loadGridData(): void {
    this.recordService.getRecords().subscribe({
      next: (data) => {
        this.gridItems = data;
        this.updateGridView();
      },
      error: (err) => console.error('Error loading data', err)
    });
  }

  // private updateGridView(): void {
  //   this.gridView = {
  //     data: this.gridItems.slice(this.skip, this.skip + this.pageSize),
  //     total: this.gridItems.length
  //   };
  // }
  private updateGridView(): void {
    this.gridView = {
      data: this.gridItems,
      total: this.gridItems.length
    };
  }
  

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.updateGridView();
  }

  public exportToExcel(): void {
    this.excelExport.save();
  }

  public onFilter(value: string): void {
    const filtered = this.gridItems.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(value.toLowerCase())
      )
    );
    this.gridView = {
      data: filtered.slice(0, this.pageSize),
      total: filtered.length
    };
  }

  public editHandler({ sender, rowIndex, dataItem }: any): void {
    this.closeEditor(sender); // Ensure only one record is edited at a time
  
    // Create the reactive form with validation for fields like email and required names
    this.formGroup = this.fb.group({
      id: [dataItem.id],
      recordId: [dataItem.recordId],
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
  

  public cancelHandler({ sender }: any): void {
    this.closeEditor(sender);
  }

  public saveHandler({ sender, rowIndex, formGroup }: any): void {
    const updatedRecord = formGroup.value;
  
    if (!updatedRecord.id) {
      console.error('Missing ID. Cannot update.');
      alert('Error: Missing ID. Please try again.');
      return;
    }
  
    // Call service to update data in the server
    this.recordService.updateRecord(updatedRecord).subscribe({
      next: () => {
        // Update the local grid items to reflect changes
        const index = this.gridItems.findIndex(item => item.id === updatedRecord.id);
        if (index !== -1) {
          this.gridItems[index] = updatedRecord;
        }
        this.updateGridView();
        this.closeEditor(sender);
      },
      error: (err) => {
        console.error('Update error:', err);
        alert('Error updating the record. Please try again.');
      }
    });
  }
  
  public removeHandler({ dataItem }: any): void {
    const id = dataItem.id;
  
    // Call service to delete the record from the server
    this.recordService.deleteRecord(id).subscribe({
      next: () => {
        // Remove the record from the local grid view
        this.gridItems = this.gridItems.filter(item => item.id !== id);
        this.updateGridView();
      },
      error: (err) => console.error('Delete error:', err)
    });
  }
  public addNewLead(): void {
    const newLead = {
      recordId:  this.generateNextRecordId(),  // or leave this blank if JSON server generates it
      lastName: '',
      firstName: '',
      email: '',
      phoneType: '',
      leadId: '',
      appointmentType: '',
      bookingAgency: '',
      assignedDate: '',
      salesRep: '',
      coordinator: '',
      syncToMobile: false,
      createdSource: '',
      mobileSyncStatus: 'N/A',
      effectiveDate: '',
      validThrough: ''
    };
  
    this.recordService.addRecord(newLead).subscribe({
      next: (createdRecord) => {
        this.gridItems.unshift(createdRecord);
        this.updateGridView();
  
        // Optional: Open the newly added record in edit mode
        this.editHandler({
          sender: this.grid,
          rowIndex: 0,
          dataItem: createdRecord
        });
      },
      error: (err) => {
        console.error('Failed to create new record:', err);
        alert('Error creating record. Try again.');
      }
    });
  }
  
  

  private closeEditor(grid: GridComponent): void {
    if (this.editedRowIndex !== null) {
      grid.closeRow(this.editedRowIndex);
      this.editedRowIndex = null;
      this.formGroup = this.fb.group({});
    }
  }
  public isItemInEditMode(item: any): boolean {
    return this.formGroup && this.formGroup.get('id')?.value === item.id;
  }
  public isNonIntl: boolean = false; // default value

  // Function to handle toggling between Intl and Non-Intl
  toggleNonIntl(value: boolean): void {
    this.isNonIntl = value;
  }
  private generateNextRecordId(): string {
    if (!this.gridItems.length) {
      return 'R001'; // start with R001 if no records
    }
  
    const existingIds = this.gridItems
      .map(item => item.recordId)
      .filter(id => /^R\d{3}$/.test(id)) // only match Rxxx format
      .map(id => parseInt(id.substring(1))) // convert to number
  
    const maxId = Math.max(...existingIds);
    const nextId = maxId + 1;
  
    return 'R' + nextId.toString().padStart(3, '0'); // zero-padded
  }
  
}
