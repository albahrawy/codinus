import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ProgressMode, ProgressPosition } from '@codinus/types';
import { CSOverlayProgress } from '@ngx-codinus/cdk/overlays';
@Component({
  selector: 'app-test-progress-overlay',
  imports: [MatButtonModule, CSOverlayProgress],
  templateUrl: './progress-overlay.component.html',
  styleUrls: ['./progress-overlay.component.scss']
})
export class TestProgressOverlayComponent {
  progressValue = 10;
  mode: ProgressMode = 'indeterminate';
  position: ProgressPosition = 'start';
  isLoading = false;
  showLoading: 'spinner' | 'bar' = 'spinner';
  cssClass = 'primary';
  startIcon = true;
  changeValue() {
    this.progressValue += 10;
  }

  changeColor() {
    this.cssClass = this.cssClass == 'primary' ? 'warn' : 'primary';

  }

  changeMode() {
    this.mode = this.mode == 'determinate' ? 'indeterminate' : 'determinate';
  }
  reset() {
    this.progressValue = 0;
  }
  changeDisplayMode() {
    this.showLoading = this.showLoading == 'spinner' ? 'bar' : 'spinner';
  }

  toggleShow() {
    this.isLoading = !this.isLoading;

  }
}
