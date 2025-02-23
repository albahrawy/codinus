import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CODINUS_DATA_SERVICE } from '@ngx-codinus/cdk/data';

@Component({
  selector: 'cs-app-migrate-pages',
  imports: [CommonModule],
  templateUrl: './app-migrate.component.html',
  styleUrl: './app-migrate.component.css',
})
export class CSMigratePagesComponent {
  private dbService = inject(CODINUS_DATA_SERVICE);

  protected start() {
    this.dbService.get({ dbContext: 'migrate', queryName: 'get-auto-pages-definition' });
  }

}
