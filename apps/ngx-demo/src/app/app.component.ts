import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { CODINUS_LOCALIZER } from '@ngx-codinus/cdk/localization';

@Component({
  imports: [RouterModule, MatDividerModule, MatListModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private localizer = inject(CODINUS_LOCALIZER);
  languages = [{ symbol: 'en', isRTL: false, name: 'English' }, { symbol: 'ar', isRTL: true, name: 'Arabic' }]


  reqtLang = this.languages[1];
  reqLangIndex = 1;
  changeLang() {
    this.localizer.changeLang(this.reqtLang);
    const reqLangIndex = this.reqLangIndex == 1 ? 0 : 1;
    this.reqtLang = this.languages[reqLangIndex];
    this.reqLangIndex = reqLangIndex;
  }
}
