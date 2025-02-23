import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { CSplitterModule, CSSplitEventArgs } from '@ngx-codinus/material/splitter';

@Component({
  selector: 'sp-ex-nested',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <div class="split-example" style="height: 400px;">
        <cs-splitter orientation="horizontal" restrictMove="true" [useTransition]="true" (dragEnd)="onDragEnd($event)" (dragStart)="onDragStart($event)">
          <cs-splitter-pane size="40">
            <cs-splitter orientation="vertical" restrictMove="true">
              <cs-splitter-pane>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tiam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                  reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </cs-splitter-pane>
              <cs-splitter-pane>
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                  totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta
                  sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
                  consequuntur magni dolores eodolor sit amet, consectetur, adipisci velit, sed quia non numquam eius
                  modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam,
                  quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
                  consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae
                  consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
                </p>
              </cs-splitter-pane>
              <cs-splitter-pane>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tiam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                  reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </cs-splitter-pane>
            </cs-splitter>
          </cs-splitter-pane>
          <cs-splitter-pane size="*">
            <cs-splitter orientation="vertical" restrictMove="true">
              <cs-splitter-pane size="25">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tiam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                  reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </cs-splitter-pane>
              <cs-splitter-pane size="75">
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                  totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta
                  sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
                  consequuntur magni dolores eodolor sit amet, consectetur, adipisci velit, sed quia non numquam eius
                  modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam,
                  quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
                  consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae
                  consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
                </p>
              </cs-splitter-pane>
            </cs-splitter>
          </cs-splitter-pane>
        </cs-splitter>
      </div>
    </div>
  `,
  imports: [CSplitterModule]
})
export class NestedComponent {
  onDragStart($event: CSSplitEventArgs) {
    console.log('start', $event);
  }
  onDragEnd($event: CSSplitEventArgs) {
    console.log('end', $event);
  }
  @HostBinding('class') class = 'split-example-page'
}
