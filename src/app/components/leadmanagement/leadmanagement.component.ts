import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
 import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, NgModel, FormsModule } from '@angular/forms';
 import { GridDataResult, GridComponent, PageChangeEvent, GridModule, CellClickEvent, CellCloseEvent, SaveEvent, DataStateChangeEvent, ColumnComponent, ColumnBase } from '@progress/kendo-angular-grid';
 import { ExcelExportComponent, KENDO_EXCELEXPORT } from '@progress/kendo-angular-excel-export';
 import { CommonModule } from '@angular/common';
 import { HttpClient, HttpClientModule } from '@angular/common/http';
 import { Button, KENDO_BUTTON, KENDO_SPLITBUTTON } from '@progress/kendo-angular-buttons';
 import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
 import { KENDO_RATING, KENDO_SWITCH, KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
 import { LabelModule } from '@progress/kendo-angular-label';
 import { KENDO_CHART, KENDO_SPARKLINE } from '@progress/kendo-angular-charts';
 import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
 import { RecordService } from '../../services/lead.service';
import { orderBy, State,process } from '@progress/kendo-data-query';
import { GridSettings, GridSettingsWithData } from '../../interface';
 
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
 // ... [unchanged imports]

export class LeadmanagementComponent implements OnInit {
  @ViewChild('excelExport', { static: false }) excelExport!: ExcelExportComponent;
  @ViewChild(GridComponent) grid!: GridComponent;

  public listItems: string[] = ['All Leads', 'Pending', 'Completed'];
  public searchPreference: string[] = ['Today\'s Leads', 'Saved 1', 'Custom 2'];
  public allData: any[] = [];
  public gridItems: any[] = [];
  public gridView: any = { data: [], total: 0 };
  // public pageSize = 10;
  // public skip = 0;
  public searchText: string = '';
  public sort: any[] = [];

  public formGroup!: FormGroup;
  private editedRowIndex: number | null = null;
  public editedItem: any = null;
  savedPreferences: any[] = []; // Store saved preferences in the dropdown
  currentPreferences: any = {}; // Store current preferences to save
  public gridState: State = {
    skip: 0,
    take: 10
  };
  public columnOrder: string[] = [];
  public columnsConfig: any[] = [];


  // public gridView: GridDataResult;
  public pageSize: number = 10;
  public skip: number = 0;
  public preferences: string[] = [];  // Store names of preferences
  public currentPreference: string = '';
  public gridData: any[] = [];
  
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public recordService: RecordService,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGridData();
    this.loadSavedPreferences();
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

  private updateGridView(): void {
    const sortedData = orderBy(this.gridItems, this.sort);
    this.gridView = {
      data: sortedData.slice(this.skip, this.skip + this.pageSize),
      total: sortedData.length
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
    this.searchAndFilter(value);
  }

  public onSearchClick(value: string): void {
    this.searchAndFilter(value);
  }

  private searchAndFilter(value: string): void {
    const searchText = value.toLowerCase();
    const filtered = this.gridItems.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchText)
      )
    );

    this.gridView = {
      data: filtered.slice(0, this.pageSize),
      total: filtered.length
    };

    this.skip = 0;
  }

  public sortChange(sort: any[]): void {
    this.sort = sort;
    this.updateGridView();
  }

  public editHandler({ sender, rowIndex, dataItem }: any): void {
    this.closeEditor(sender);
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

  public removeHandler({ dataItem }: any): void {
    const id = dataItem.id;
    this.recordService.deleteRecord(id).subscribe({
      next: () => {
        this.gridItems = this.gridItems.filter(item => item.id !== id);
        this.updateGridView();
      },
      error: (err) => console.error('Delete error:', err)
    });
  }

  public addNewLead(): void {
    const newLead = {
      recordId: this.generateNextRecordId(),
      lastName: '',
      firstName: '',
      email: '',
      phoneType: '',
      leadId: '',
      appointmentType: '',
      bookingAgency: '',
      assignedDate: new Date(),
      salesRep: '',
      coordinator: '',
      syncToMobile: false,
      createdSource: '',
      mobileSyncStatus: 'N/A',
      effectiveDate: new Date(),
      validThrough: new Date()
    };

    this.recordService.addRecord(newLead).subscribe({
      next: (createdRecord) => {
        this.gridItems.unshift(createdRecord);
        this.updateGridView();
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

  public isNonIntl: boolean = false;

  toggleNonIntl(value: boolean): void {
    this.isNonIntl = value;
  }

  private generateNextRecordId(): string {
    if (!this.gridItems.length) {
      return 'R001';
    }

    const existingIds = this.gridItems
      .map(item => item.recordId)
      .filter(id => /^R\d{3}$/.test(id))
      .map(id => parseInt(id.substring(1)));

    const maxId = Math.max(...existingIds);
    const nextId = maxId + 1;

    return 'R' + nextId.toString().padStart(3, '0');
  }

  public onRowDoubleClick(event: any): void {
    const rowIndex = this.gridView.data.findIndex((item: any) => item === event.dataItem);
    if (rowIndex !== -1) {
      this.editHandler({ sender: this.grid, rowIndex, dataItem: event.dataItem });
    }
  }

  public onGridClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() !== 'input') {
      this.saveAndExitEdit();
    }
  }
  public onCellBlur(dataItem: any): void {
    this.recordService.updateRecord(dataItem).subscribe(() => {
      this.loadGridData();
    });
  }
  public isItemInEditModeInline(dataItem: any): boolean {
    return dataItem?.inEdit;
  }

  private saveAndExitEdit(): void {
    if (this.editedItem) {
      const index = this.gridView.data.findIndex((item:any) => item.recordId === this.editedItem.recordId);
      if (index !== -1) {
        this.gridView.data[index] = { ...this.gridView.data[index], ...this.editedItem };
        this.gridView.data[index].inEdit = false;
      }
      this.editedItem = null;
    }
  }
  public cellClickHandler(event: CellClickEvent): void {
    if (event.type === 'click') { 
    }
  }

  // ✅ When you click outside a cell
  public cellCloseHandler(event: CellCloseEvent): void {
    if (!event.formGroup) {
      return; // No formGroup, no action
    }
  
    if (!event.formGroup.valid) {
      event.preventDefault(); // Prevent closing if invalid
      return;
    }
  
    const updatedItem = { ...event.dataItem, ...event.formGroup.value }; 
    this.recordService.updateRecord(updatedItem).subscribe({
      next: () => {
        const index = this.gridItems.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          this.gridItems[index] = updatedItem;
        }
        this.updateGridView();
        console.log('Record updated successfully');
      },
      error: (err) => {
        console.error('Update error:', err);
        alert('Error updating record.');
      }
    });
  }

  // Refined the saveHandler method to ensure proper data saving and UI updates
  public saveHandler(event: SaveEvent): void {
    const updatedItem = event.formGroup.value;

    if (!updatedItem.id) {
      console.error('Missing ID. Cannot update.');
      alert('Error: Missing ID. Please try again.');
      return;
    }

    this.recordService.updateRecord(updatedItem).subscribe({
      next: (response) => {
        // Update the gridItems array with the updated record from the server response
        const index = this.gridItems.findIndex(item => item.id === response.id);
        if (index !== -1) {
          this.gridItems[index] = response;
        } else {
          console.warn('Updated item not found in gridItems. Adding it.');
          this.gridItems.push(response);
        }

        // Update the gridView to reflect the changes in the UI
        this.updateGridView();

        // Force change detection to ensure the UI is refreshed
        this.cdr.detectChanges();

        console.log('Record updated successfully:', response);
      },
      error: (err) => {
        console.error('Update error:', err);
        alert('Error updating the record. Please try again.');
      }
    });
  }

  public cellDblClickHandler(event: any): void {
    const rowIndex = event.rowIndex;
    const columnIndex = event.columnIndex;
    const data = this.grid.data as any[] | null;
    if (!data) {
      console.error('Grid data is null or undefined');
      return;
    }
    const dataItem = data[rowIndex];
    console.log('Double-clicked cell:', event);
    console.log('Row data:', dataItem);
    const formGroup = this.createFormGroup(dataItem);
    this.grid.editCell(rowIndex, columnIndex, formGroup);
  }

  private createFormGroup(dataItem: any): FormGroup {
    return this.fb.group({
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
  }
  public handleDblClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const rowElement = target.closest('tr');
    const cellElement = target.closest('td');

    if (!rowElement || !cellElement) {
      console.error('Could not determine row or cell from double-click event.');
      return;
    }

    const rowIndex = parseInt(rowElement.getAttribute('data-kendo-grid-item-index') || '-1', 10);
    const columnIndex = Array.from(rowElement.children).indexOf(cellElement);

    if (rowIndex === -1 || columnIndex === -1) {
      console.error('Invalid row or column index.');
      return;
    }

    const dataItem = this.gridView.data[rowIndex];
    if (!dataItem) {
      console.error('No data item found for the given row index.');
      return;
    }

    const formGroup = this.createFormGroup(dataItem);
    this.grid.editCell(rowIndex, columnIndex, formGroup);
  }
  public savePreferences(): void {
    const name = prompt('Enter a name for the grid state:');
    if (!name) return;

    if (!this.columnsConfig?.length) {
      console.warn('❗ Column config is empty, cannot save.');
      return;
    }

    const preference = {
      name,
      state: this.gridState,
      columnsConfig: this.columnsConfig
    };

    const preferences = JSON.parse(localStorage.getItem('preferences') || '[]');
    preferences.push(preference);
    localStorage.setItem('preferences', JSON.stringify(preferences));

    this.loadSavedPreferences(); // Refresh the dropdown options after saving a new preference
  }
  
  public loadPreference(name: string): void {
    const preferences = JSON.parse(localStorage.getItem('preferences') || '[]');
    const selected = preferences.find((p: any) => p.name === name);
    if (!selected) return;

    this.gridState = selected.state;
    this.skip = this.gridState.skip || 0;
    this.pageSize = this.gridState.take || 10;

    this.applyColumnSettings(selected.columnsConfig); // Apply column settings
    this.loadGridData(); // Load the grid data based on the state
  }
  
  
  private loadSavedPreferences(): void {
    const preferences = JSON.parse(localStorage.getItem('preferences') || '[]');
    this.preferences = preferences.map((p: any) => p.name); // Map saved preference names
    console.log('Saved preferences loaded:', this.preferences);
  }


  public dataStateChange(state: DataStateChangeEvent): void {
    this.gridState = state;
    this.skip = state.skip!;
    this.pageSize = state.take!;
    localStorage.setItem('gridState', JSON.stringify(state));
  }
  public onColumnReorder(): void {
    const currentColumns = this.grid.columns.toArray();

    this.columnsConfig = currentColumns
      .filter((col): col is ColumnComponent => col instanceof ColumnComponent)
      .map((col, index) => ({
        field: col.field,
        title: col.title,
        hidden: col.hidden,
        width: col.width,
        orderIndex: index
      }));

    console.log('📦 Updated columnsConfig:', this.columnsConfig);
  }
  
  public applyColumnSettings(columnsConfig: any[]): void {
    if (!columnsConfig?.length) return;

    const currentColumns = this.grid.columns.toArray();

    // Match and reorder columns based on saved config
    const ordered = columnsConfig.map(cfg =>
      currentColumns.find(col =>
        col instanceof ColumnComponent &&
        ((col.field && col.field === cfg.field) || col.title === cfg.title)
      )
    ).filter(c => !!c) as ColumnComponent[];

    this.grid.columns.reset(ordered);
    this.grid.columns.notifyOnChanges();

    // Apply visibility and width safely
    ordered.forEach((col, i) => {
      const cfg = columnsConfig[i];
      if (cfg) {
        if (cfg.hidden !== undefined) col.hidden = cfg.hidden;
        if (cfg.width !== undefined) col.width = cfg.width;
      }
    });
  }
  public mapGridSettings(gridSettings: GridSettings): GridSettingsWithData {
    const state = gridSettings.state;
    this.mapDateFilter(state.filter);

    return {
      name: gridSettings.name,
      state,
      columnsConfig: gridSettings.columnsConfig.sort((a, b) => a.orderIndex - b.orderIndex),
      gridData: process(this.gridData, state)
    };
  }

  // Map date filter if needed
  private mapDateFilter = (descriptor: any) => {
    const filters = descriptor.filters || [];

    filters.forEach((filter: any) => {
      if (filter.filters) {
        this.mapDateFilter(filter);
      } else if (filter.field === "FirstOrderedOn" && filter.value) {
        filter.value = new Date(filter.value);
      }
    });
  };
    
  
}