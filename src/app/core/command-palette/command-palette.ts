import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { AuthorizationService } from '../auth/authorization.service';
import { Permission, PermissionMode, PERMISSIONS } from '../auth/permissions';
import { FEATURE_ACCESS } from '../config/feature-access';
import { ROUTE_PATHS } from '../config/route-paths';
import { NAVIGATION_SECTIONS } from '../layout/navigation';

type CommandGroup = 'Navigate' | 'Create' | 'Search';

interface PaletteCommand {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly group: CommandGroup;
  readonly route: string;
  readonly queryParams?: Readonly<Record<string, string>>;
  readonly keywords?: readonly string[];
  readonly permissions?: readonly Permission[];
  readonly permissionMode?: PermissionMode;
}

const QUICK_ACTIONS: readonly PaletteCommand[] = [
  {
    id: 'create-product',
    label: 'New product',
    description: 'Create a product master record',
    group: 'Create',
    route: `/${ROUTE_PATHS.products}/new`,
    permissions: [PERMISSIONS.productCreate],
  },
  {
    id: 'create-purchase-order',
    label: 'New purchase order',
    description: 'Create a supplier purchase order draft',
    group: 'Create',
    route: `/${ROUTE_PATHS.purchasing}/new`,
    permissions: [PERMISSIONS.purchaseCreate],
  },
  {
    id: 'create-receipt',
    label: 'New goods receipt',
    description: 'Record an approved purchase-order delivery',
    group: 'Create',
    route: `/${ROUTE_PATHS.receiving}/new`,
    permissions: [PERMISSIONS.purchaseReceive],
  },
  {
    id: 'create-transfer',
    label: 'New inventory transfer',
    description: 'Move stock between warehouses',
    group: 'Create',
    route: `/${ROUTE_PATHS.transfers}/new`,
    permissions: [PERMISSIONS.inventoryTransfer],
  },
  {
    id: 'create-adjustment',
    label: 'New inventory adjustment',
    description: 'Create a controlled stock correction',
    group: 'Create',
    route: `/${ROUTE_PATHS.adjustments}/new`,
    permissions: [PERMISSIONS.inventoryAdjust],
  },
  {
    id: 'create-count',
    label: 'New stock count',
    description: 'Create a physical inventory count session',
    group: 'Create',
    route: `/${ROUTE_PATHS.stockCounts}/new`,
    permissions: [PERMISSIONS.inventoryCount],
  },
  {
    id: 'create-sales-order',
    label: 'New sales order',
    description: 'Create a customer sales order draft',
    group: 'Create',
    route: `/${ROUTE_PATHS.sales}/new`,
    permissions: [PERMISSIONS.salesCreate],
  },
  {
    id: 'create-customer',
    label: 'New customer',
    description: 'Create a customer record',
    group: 'Create',
    route: `/${ROUTE_PATHS.customers}/new`,
    permissions: [PERMISSIONS.customerManage],
  },
  {
    id: 'create-supplier',
    label: 'New supplier',
    description: 'Create a supplier record',
    group: 'Create',
    route: `/${ROUTE_PATHS.suppliers}/new`,
    permissions: [PERMISSIONS.supplierManage],
  },
  {
    id: 'create-user',
    label: 'New user',
    description: 'Create an application user',
    group: 'Create',
    route: `/${ROUTE_PATHS.administration}/users/new`,
    permissions: [PERMISSIONS.userManage],
  },
  {
    id: 'create-role',
    label: 'New role',
    description: 'Create an authorization role',
    group: 'Create',
    route: `/${ROUTE_PATHS.administration}/roles/new`,
    permissions: [PERMISSIONS.roleManage],
  },
];

const SEARCH_SCOPES: readonly Omit<PaletteCommand, 'id' | 'label' | 'queryParams'>[] = [
  {
    description: 'Products',
    group: 'Search',
    route: `/${ROUTE_PATHS.products}`,
    ...FEATURE_ACCESS.products,
  },
  {
    description: 'Inventory balances',
    group: 'Search',
    route: `/${ROUTE_PATHS.inventory}`,
    ...FEATURE_ACCESS.inventory,
  },
  {
    description: 'Stock movements',
    group: 'Search',
    route: `/${ROUTE_PATHS.stockMovements}`,
    ...FEATURE_ACCESS.stockMovements,
  },
  {
    description: 'Purchase orders',
    group: 'Search',
    route: `/${ROUTE_PATHS.purchasing}`,
    ...FEATURE_ACCESS.purchasing,
  },
  {
    description: 'Suppliers',
    group: 'Search',
    route: `/${ROUTE_PATHS.suppliers}`,
    ...FEATURE_ACCESS.suppliers,
  },
  {
    description: 'Customers',
    group: 'Search',
    route: `/${ROUTE_PATHS.customers}`,
    ...FEATURE_ACCESS.customers,
  },
  {
    description: 'Sales orders',
    group: 'Search',
    route: `/${ROUTE_PATHS.sales}`,
    ...FEATURE_ACCESS.sales,
  },
  {
    description: 'Warehouses',
    group: 'Search',
    route: `/${ROUTE_PATHS.masterData}/warehouses`,
    ...FEATURE_ACCESS.masterData,
  },
];

@Component({
  selector: 'app-command-palette',
  imports: [CdkTrapFocus],
  templateUrl: './command-palette.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteComponent implements OnChanges {
  private readonly router = inject(Router);
  private readonly authorization = inject(AuthorizationService);

  @Input() open = false;
  @Input() initialQuery = '';
  @Output() readonly closed = new EventEmitter<void>();

  @ViewChild('searchInput')
  private searchInput?: ElementRef<HTMLInputElement>;

  readonly query = signal('');
  readonly activeIndex = signal(0);

  private readonly staticCommands = computed<readonly PaletteCommand[]>(() => {
    const navigationCommands = NAVIGATION_SECTIONS.flatMap((section) =>
      section.items.map<PaletteCommand>((item) => ({
        id: `navigate:${item.route}`,
        label: item.label,
        description: section.label,
        group: 'Navigate',
        route: item.route,
        keywords: [section.label, item.label],
        permissions: item.permissions,
        permissionMode: item.permissionMode,
      })),
    );

    return [...navigationCommands, ...QUICK_ACTIONS].filter((command) =>
      this.canUse(command),
    );
  });

  readonly results = computed<readonly PaletteCommand[]>(() => {
    const query = this.query().trim().toLocaleLowerCase();

    const staticMatches = this.staticCommands().filter((command) => {
      if (!query) {
        return true;
      }

      return [
        command.label,
        command.description,
        ...(command.keywords ?? []),
      ]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query);
    });

    const searchCommands =
      query.length >= 2
        ? SEARCH_SCOPES.filter((command) => this.canUse(command)).map<PaletteCommand>(
            (scope) => ({
              ...scope,
              id: `search:${scope.route}:${query}`,
              label: `Search ${scope.description.toLocaleLowerCase()} for “${this.query().trim()}”`,
              queryParams: { search: this.query().trim() },
            }),
          )
        : [];

    return [...staticMatches, ...searchCommands].slice(0, 14);
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.query.set(this.initialQuery);
      this.activeIndex.set(0);
      queueMicrotask(() => this.searchInput?.nativeElement.focus());
    }
  }

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.runActive();
        break;
      case 'Escape':
        event.preventDefault();
        this.closed.emit();
        break;
    }
  }

  select(index: number): void {
    this.activeIndex.set(index);
  }

  run(command: PaletteCommand): void {
    void this.router.navigate([command.route], {
      queryParams: command.queryParams ?? undefined,
    });
    this.closed.emit();
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  private moveActive(delta: number): void {
    const count = this.results().length;

    if (count === 0) {
      this.activeIndex.set(0);
      return;
    }

    this.activeIndex.update((index) => (index + delta + count) % count);
  }

  private runActive(): void {
    const command = this.results()[this.activeIndex()];

    if (command) {
      this.run(command);
    }
  }

  private canUse(command: {
    readonly permissions?: readonly Permission[];
    readonly permissionMode?: PermissionMode;
  }): boolean {
    return this.authorization.can(
      command.permissions ?? [],
      command.permissionMode ?? 'all',
    );
  }
}
