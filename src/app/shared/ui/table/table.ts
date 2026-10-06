import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-table',
  template: `
    <div class="w-full overflow-x-auto rounded-md border border-border bg-surface">
      <table
        class="w-full min-w-max border-collapse text-left text-sm tabular-nums
          [&_th]:h-9 [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-border
          [&_th]:bg-surface-muted [&_th]:px-3 [&_th]:text-xs [&_th]:font-semibold
          [&_th]:text-muted-foreground
          [&_td]:h-10 [&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-2
          [&_td]:align-middle [&_td]:text-sm
          [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-surface-muted
          [&_tbody_tr:last-child_td]:border-b-0"
      >
        <ng-content />
      </table>
    </div>
  `,
  host: {
    class: 'block min-w-0',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {}
