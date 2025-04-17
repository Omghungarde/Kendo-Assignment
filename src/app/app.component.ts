import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiComponent } from "./ui/ui.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { KENDO_BUTTONS } from "@progress/kendo-angular-buttons";
import { KENDO_INPUTS } from "@progress/kendo-angular-inputs";
import { FormsModule } from "@angular/forms";
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,KENDO_DIALOG, KENDO_BUTTONS, KENDO_INPUTS, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'assignment';
  public close(status: string): void {
    console.log(`Dialog result: ${status}`);
  }
}
