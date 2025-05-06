import { Component, OnInit } from '@angular/core';
import { GridComponent } from '@progress/kendo-angular-grid';
import { KENDO_GRID } from '@progress/kendo-angular-grid';
import { ColumnSettings, GridSettings } from '../new/interface2';
import { process, State } from '@progress/kendo-data-query';
import { ServiceService } from '../new/service.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-new',
  standalone: true,
  imports: [KENDO_GRID, RouterModule],
  templateUrl: './new.component.html',
  styleUrl: './new.component.css'
})
export class NewComponent implements OnInit {

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
      { field: 'lastName', title: 'Last Name', width: 200, editable: true, orderIndex: 1 },
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

  constructor(private persistingService: ServiceService) {}

  ngOnInit(): void {
    const localSettings = this.persistingService.getFromLocal<GridSettings>('gridSettings');

    if (localSettings) {
      this.gridSettings = this.mapGridSettings(localSettings);
    }

    this.loadGridData();
  }

  public get savedStateExists(): boolean {
    return !!this.persistingService.getFromLocal<GridSettings>('gridSettings');
  }

  loadGridData(): void {
    this.persistingService.fetchGridData().subscribe((data) => {
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

    this.persistingService.saveToLocal('gridSettings', gridConfig);
  }

  public loadSavedState(): void {
    const savedSettings = this.persistingService.getFromLocal<GridSettings>('gridSettings');
    if (savedSettings) {
      this.gridSettings = this.mapGridSettings(savedSettings);
      this.loadGridData();
    }
  }

  public mapGridSettings(gridSettings: GridSettings): GridSettings {
    return {
      state: gridSettings.state,
      columnsConfig: gridSettings.columnsConfig.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
      gridData: { data: [], total: 0 } // will be loaded in `loadGridData`
    };
  }
}
