import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { KENDO_GRID } from '@progress/kendo-angular-grid';
import { ColumnSettings, GridSettings } from '../../new/interface2';
import { process, State } from '@progress/kendo-data-query';
import { ServiceService } from '../../new/service.service';
import { RouterModule } from '@angular/router';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ExcelExportData, ExcelExportModule } from '@progress/kendo-angular-excel-export';

@Component({
  selector: 'app-leadmanagement',
  standalone: true,
  imports: [
    CommonModule,
    GridModule,
    ReactiveFormsModule,
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
    FormsModule,
    ExcelExportModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './leadmanagement.component.html',
  styleUrls: ['./leadmanagement.component.css']
})
export class LeadmanagementComponent implements OnInit {
  
  @ViewChild('grid', { static: true }) grid!: GridComponent;
  public listItems: string[] = ['All Leads', 'Pending', 'Completed'];
  public gridSettings: GridSettings = {
      state: {
        skip: 0,
        take: 10,
        filter: { logic: 'and', filters: [] },
        group: []
      },
      gridData: { data: [], total: 0 },
      columnsConfig: [
        { field: 'recordId', title: 'Record ID', width: 150, editable: false, orderIndex: 0 },
        { field: 'lastName', title: 'Last Name', width: 200, orderIndex: 1 },
        { field: 'firstName', title: 'First Name', width: 200, editable: true, orderIndex: 2 },
        { field: 'email', title: 'Email', width: 250, editable: true, orderIndex: 3 },
        { field: 'phoneType', title: 'Phone Type', width: 150, editable: true, orderIndex: 4 },
        { field: 'leadId', title: 'Lead ID', width: 200, editable: true, orderIndex: 5 },
        { field: 'appointmentType', title: 'Appointment Type', width: 180, editable: true, orderIndex: 6 },
        { field: 'bookingAgency', title: 'Booking Agency', width: 180, editable: true, orderIndex: 7 },
        { field: 'assignedDate', title: 'Assigned Date', width: 180, editable: true, orderIndex: 8 },
        { field: 'salesRep', title: 'Sales Rep', width: 180, editable: true, orderIndex: 9 },
        { field: 'coordinator', title: 'Coordinator', width: 180, editable: true, orderIndex: 10 },
        { field: 'syncToMobile', title: 'Sync To Mobile', width: 150, editable: true, orderIndex: 11 },
        { field: 'createdSource', title: 'Created Source', width: 180, editable: true, orderIndex: 12 },
        { field: 'mobileSyncStatus', title: 'Mobile Sync Status', width: 180, editable: true, orderIndex: 13 },
        { field: 'effectiveDate', title: 'Effective Date', width: 180, editable: true, orderIndex: 14 },
        { field: 'validThrough', title: 'Valid Through', width: 180, editable: true, orderIndex: 15 }
      ]
    };
  
    public editField = 'inEdit';
    public cellArgs!: CellClickEvent;
    public savedPreferences: string[] = [];
    public selectedPreference: string = '';
    public isPreferencePopupOpen: boolean = false;
    public newPreferenceName: string = '';
    public searchQuery: string = '';
    private originalGridData: any[] = [];
    public isNonIntl: boolean = false;

    constructor(private persistingService: ServiceService, private fb: FormBuilder, private elRef: ElementRef) {}
  
    ngOnInit(): void {
      const localSettings = this.persistingService.getFromLocal<GridSettings>('gridSettings');
  
      if (localSettings) {
        this.gridSettings = this.mapGridSettings(localSettings);
      }
  
      this.loadGridData();
      this.refreshSavedPreferences(); // Load saved preferences on initialization
    }
  
    public get savedStateExists(): boolean {
      return !!this.persistingService.getFromLocal<GridSettings>('gridSettings');
    }
  
    loadGridData(): void {
      this.persistingService.fetchGridData().subscribe((data) => {
        this.originalGridData = data;
        this.gridSettings.gridData = process(data, this.gridSettings.state);
      });
    }
  
    public dataStateChange(state: State): void {
      this.gridSettings.state = state;
      this.persistingService.fetchGridData().subscribe((data) => {
        this.gridSettings.gridData = process(data, state);
      });
    }
  
    public saveGridSettings(grid: GridComponent): void {
      const name = prompt('Enter a name for the grid state:');
      if (!name) return;
  
      const gridConfig: GridSettings = {
        state: this.gridSettings.state,
        gridData: this.gridSettings.gridData,
        columnsConfig: grid.columns.toArray().map((col: any) => ({
          field: col.field,
          width: col.width,
          title: col.title,
          filter: col.filter,
          format: col.format,
          filterable: col.filterable,
          orderIndex: col.orderIndex,
          hidden: col.hidden
        }))
      };
  
      const preferences = JSON.parse(localStorage.getItem('preferences') || '[]');
      preferences.push({ name, gridConfig });
      localStorage.setItem('preferences', JSON.stringify(preferences));
  
      this.refreshSavedPreferences();
    }
  
    public loadSavedState(): void {
      const preferences = JSON.parse(localStorage.getItem('preferences') || '[]');
      const selected = preferences.find((p: any) => p.name === this.selectedPreference);
      if (!selected) return;
  
      this.gridSettings.state = selected.gridConfig.state;
      this.gridSettings.columnsConfig = selected.gridConfig.columnsConfig;
  
      // Apply column settings to the grid
      const gridColumns = this.gridSettings.columnsConfig.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      this.gridSettings.columnsConfig = gridColumns;
  
      this.loadGridData(); // Reload the grid data based on the state
    }
  
    public mapGridSettings(gridSettings: GridSettings): GridSettings {
      return {
        state: gridSettings.state,
        columnsConfig: gridSettings.columnsConfig.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
        gridData: { data: [], total: 0 } // will be loaded in `loadGridData`
      };
    }
  
    public onCellDoubleClick(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      const cell = target.closest('kendo-grid-cell');
      if (cell) {
        const columnField = cell.getAttribute('data-column-field');
        if (columnField) {
          this.editField = columnField;
          console.log(`Double-clicked on column: ${columnField}`);
        }
      }
    }
  
    public cellClickHandler(args: CellClickEvent): void {
      this.cellArgs = args;
    }
  
    public onDblClick(): void {
      if (this.cellArgs && !this.cellArgs.isEdited) {
        this.cellArgs.sender.editCell(
          this.cellArgs.rowIndex,
          this.cellArgs.columnIndex,
          this.fb.group(this.cellArgs.dataItem)
        );
      }
    }
  
    public cellCloseHandler(args: any): void {
      if (args.formGroup && args.formGroup.valid) {
        const updatedItem = args.formGroup.value;
        Object.assign(args.dataItem, updatedItem);
        console.log('Updated data item:', args.dataItem);
  
        // Save the updated data to the backend
        this.persistingService.updateData(args.dataItem).subscribe(
          (response) => {
            console.log('Data successfully updated on the backend:', response);
          },
          (error) => {
            console.error('Error updating data on the backend:', error);
          }
        );
      }
    }
  
    public savePreference(): void {
      if (this.selectedPreference) {
        console.log(`Saving preference: ${this.selectedPreference}`);
        // Logic to save the preference
        this.savedPreferences.push(this.selectedPreference);
      }
    }
  
    public openPreferencePopup(): void {
      this.isPreferencePopupOpen = true;
    }
  
    public closePreferencePopup(): void {
      this.isPreferencePopupOpen = false;
      this.newPreferenceName = '';
    }
  
    public saveNewPreference(): void {
      if (this.newPreferenceName) {
        this.savedPreferences.push(this.newPreferenceName);
        console.log(`Saved preference: ${this.newPreferenceName}`);
        this.closePreferencePopup();
      }
    }
  
    public loadPreference(): void {
      const selectedPreference = this.savedPreferences.find(
        (pref) => pref === this.selectedPreference
      );
      if (selectedPreference) {
        console.log(`Loading preference: ${selectedPreference}`);
        // Logic to load grid settings for the selected preference
      }
    }
  
    public savePreferences(): void {
      const name = prompt('Enter a name for the grid state:');
      if (!name) return;
  
      if (!this.gridSettings.columnsConfig?.length) {
        console.warn('❗ Column config is empty, cannot save.');
        return;
      }
  
      const preference = {
        name,
        state: this.gridSettings.state,
        columnsConfig: this.gridSettings.columnsConfig
      };
  
      const preferences = JSON.parse(localStorage.getItem('preferences') || '[]');
      preferences.push(preference);
      localStorage.setItem('preferences', JSON.stringify(preferences));
  
      this.refreshSavedPreferences(); // Refresh the dropdown options after saving a new preference
    }
  
    public loadSavedPreference(name: string): void {
      const preferences = JSON.parse(localStorage.getItem('preferences') || '[]');
      const selected = preferences.find((p: any) => p.name === name);
      if (!selected) return;
  
      this.gridSettings.state = selected.state;
      this.gridSettings.columnsConfig = selected.columnsConfig;
  
      this.loadGridData(); // Load the grid data based on the state
    }
  
    public clearPreference(): void {
      // Reset the grid settings to their default state
      this.gridSettings = {
        state: {
          skip: 0,
          take: 10,
          filter: { logic: 'and', filters: [] },
          group: []
        },
        gridData: { data: [], total: 0 },
        columnsConfig: [
          { field: 'recordId', title: 'Record ID', width: 150, editable: false, orderIndex: 0 },
          { field: 'lastName', title: 'Last Name', width: 200, orderIndex: 1 },
          { field: 'firstName', title: 'First Name', width: 200, editable: true, orderIndex: 2 },
          { field: 'email', title: 'Email', width: 250, editable: true, orderIndex: 3 },
          { field: 'phoneType', title: 'Phone Type', width: 150, editable: true, orderIndex: 4 },
          { field: 'leadId', title: 'Lead ID', width: 200, editable: true, orderIndex: 5 },
          { field: 'appointmentType', title: 'Appointment Type', width: 180, editable: true, orderIndex: 6 },
          { field: 'bookingAgency', title: 'Booking Agency', width: 180, editable: true, orderIndex: 7 },
          { field: 'assignedDate', title: 'Assigned Date', width: 180, editable: true, orderIndex: 8 },
          { field: 'salesRep', title: 'Sales Rep', width: 180, editable: true, orderIndex: 9 },
          { field: 'coordinator', title: 'Coordinator', width: 180, editable: true, orderIndex: 10 },
          { field: 'syncToMobile', title: 'Sync To Mobile', width: 150, editable: true, orderIndex: 11 },
          { field: 'createdSource', title: 'Created Source', width: 180, editable: true, orderIndex: 12 },
          { field: 'mobileSyncStatus', title: 'Mobile Sync Status', width: 180, editable: true, orderIndex: 13 },
          { field: 'effectiveDate', title: 'Effective Date', width: 180, editable: true, orderIndex: 14 },
          { field: 'validThrough', title: 'Valid Through', width: 180, editable: true, orderIndex: 15 }
        ]
      };
  
      this.selectedPreference = ''; // Clear the dropdown selection
      this.loadGridData(); // Reload the grid data to reflect the default state
    }
  
    private refreshSavedPreferences(): void {
      const preferences = JSON.parse(localStorage.getItem('preferences') || '[]');
      this.savedPreferences = preferences.map((p: any) => p.name); // Map saved preference names
      console.log('Saved preferences loaded:', this.savedPreferences);
    }

  public searchGrid(): void {
    if (!this.searchQuery.trim()) {
      // Reset to original data if search query is empty
      this.gridSettings.gridData = process(this.originalGridData, this.gridSettings.state);
      return;
    }

    const filteredData = this.originalGridData.filter((item: any) => {
      return Object.values(item).some((value) =>
        String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    });

    this.gridSettings.gridData = process(filteredData, this.gridSettings.state);
  }
  toggleNonIntl(value: boolean): void {
    this.isNonIntl = value;
  }
  public exportToExcel(): void {
    if (this.grid) {
      this.grid.saveAsExcel();
    } else {
      console.error('Grid reference is not available.');
    }
  }


  public saveNewRow(dataItem: any): void {
    // Save the new row to the JSON (mock implementation)
    this.persistingService.updateData(dataItem).subscribe(
      (response) => {
        console.log('New row saved:', response);
      },
      (error) => {
        console.error('Error saving new row:', error);
      }
    );
  }
}