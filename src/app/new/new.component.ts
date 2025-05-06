// 1. Required Angular & Kendo imports
import { Component } from '@angular/core';
import { GridComponent } from '@progress/kendo-angular-grid';
import { KENDO_GRID } from '@progress/kendo-angular-grid';
import { ColumnSettings, GridSettings, sampleProducts } from '../new/interface2';
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
export class NewComponent {

  // 2. Main grid settings object with default structure
  public gridSettings: GridSettings = {
    state: {
      skip: 0,
      take: 5,
      filter: {
        logic: 'and',
        filters: []
      },
      group: []
    },
    gridData: process(sampleProducts, {
      skip: 0,
      take: 5,
      filter: {
        logic: 'and',
        filters: []
      },
      group: []
    }),
    columnsConfig: [
      {
        field: 'ProductID',
        title: 'ID',
        filterable: false,
        filter: 'text',
        width: 60,
        hidden: false
      },
      {
        field: 'lastName',
        title: 'Last Name',
        filterable: false,
        filter: 'text',
        width: 60,
        hidden: false
      },
      {
        field: 'ProductName',
        title: 'Product Name',
        filterable: true,
        filter: 'text',
        width: 300,
        hidden: false
      },
      {
        field: 'FirstOrderedOn',
        title: 'First Ordered On',
        filter: 'date',
        format: '{0:d}',
        width: 240,
        filterable: true,
        hidden: false
      },
      {
        field: 'UnitPrice',
        title: 'Unit Price',
        filter: 'numeric',
        format: '{0:c}',
        width: 180,
        filterable: true,
        hidden: false
      },
      {
        field: 'Discontinued',
        title: 'Discontinued',
        filter: 'boolean',
        width: 120,
        filterable: true,
        hidden: false
      }
    ]
  };

  // 3. Getter for checking if a saved state exists in localStorage
  public get savedStateExists(): boolean {
    return !!this.persistingService.getFromLocal<GridSettings>('gridSettings');
  }

  // 4. Constructor loads state from localStorage or fetches from db.json
  constructor(private persistingService: ServiceService) {
    const localSettings = this.persistingService.getFromLocal<GridSettings>('gridSettings');

    if (localSettings) {
      this.gridSettings = this.mapGridSettings(localSettings);
    } else {
      this.persistingService.fetchGridSettings().subscribe({
        next: (fetchedSettings) => {
          this.persistingService.saveToLocal('gridSettings', fetchedSettings);
          this.gridSettings = this.mapGridSettings(fetchedSettings);
        },
        error: (err) => {
          console.error('Failed to load from db.json', err);
        }
      });
    }
  }

  // 5. Called on Kendo data state change (paging, sorting, etc.)
  public dataStateChange(state: State): void {
    this.gridSettings.state = state;
    this.gridSettings.gridData = process(sampleProducts, state);
  }

  // 6. Save the grid's current layout and state to localStorage
  public saveGridSettings(grid: GridComponent): void {
    const gridConfig: GridSettings = {
      state: this.gridSettings.state,
      gridData: this.gridSettings.gridData,
      columnsConfig: grid.columns.toArray().map((item: any) => ({
        field: item.field,
        width: item.width,
        title: item.title,
        filter: item.filter,
        format: item.format,
        filterable: item.filterable,
        orderIndex: item.orderIndex,
        hidden: item.hidden
      }))
    };

    this.persistingService.saveToLocal('gridSettings', gridConfig);
  }

  // 7. Maps a loaded grid setting into current structure
  public mapGridSettings(gridSettings: GridSettings): GridSettings {
    const state = gridSettings.state;
    this.mapDateFilter(state.filter);

    return {
      state,
      columnsConfig: gridSettings.columnsConfig.sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
      ),
      gridData: process(sampleProducts, state)
    };
  }

  // 8. Ensures date filters are cast back to Date objects
  private mapDateFilter(descriptor: any): void {
    const filters = descriptor?.filters ?? [];

    for (const filter of filters) {
      if (filter.filters) {
        this.mapDateFilter(filter);
      } else if (filter.field === 'FirstOrderedOn' && filter.value) {
        filter.value = new Date(filter.value);
      }
    }
  }

  // 9. Manually load saved grid state (e.g. from button click)
  public loadSavedState(): void {
    const savedSettings = this.persistingService.getFromLocal<GridSettings>('gridSettings');
    if (savedSettings) {
      this.gridSettings = this.mapGridSettings(savedSettings);
    }
  }
}
