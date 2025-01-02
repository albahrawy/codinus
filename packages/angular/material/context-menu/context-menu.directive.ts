import {
    Component, ComponentRef, Directive, ElementRef, EnvironmentInjector,
    OnDestroy, OutputRefSubscription, Renderer2, ViewContainerRef, booleanAttribute,
    createComponent, effect, inject, input, output, viewChild
} from "@angular/core";
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { IAction } from "@codinus/types";
import { CSTranslatePipe } from "@ngx-codinus/cdk/localization";
import { createEventManager } from "@ngx-codinus/core/events";
import { Subscription } from "rxjs";
import {
    CODINUS_CONTEXT_MENU_PARENT,
    ConextMenuOpenArgs, ConextMenuOpeningArgs, IContextMenuClickArgs,
    IContextMenuItem
} from "./types";

class CSContextMenuTracker {
    private static _openContextMenuTrigger?: MatMenuTrigger;
    static update(trigger: MatMenuTrigger) {
        if (CSContextMenuTracker._openContextMenuTrigger !== trigger) {
            CSContextMenuTracker._openContextMenuTrigger?.closeMenu();
            CSContextMenuTracker._openContextMenuTrigger = trigger;
        }
    }
}

@Component({
    selector: 'context-menu-component',
    template: `
        <mat-menu #listContextMenu="matMenu" [hasBackdrop]="false">
            <ng-template matMenuContent let-info="info">
            @for(item of info?.menuItems; track item){
                @if(!item.hidden){
                    <button mat-menu-item [disabled]="item.disabled"
                        (click)="contextMenuDirective._onContextMenuClick(item,info.data)">
                        @if(item?.icon){
                            <mat-icon [class]="item.cssClass" [fontIcon]="item.icon" />
                        }
                        <span>{{item.caption|csTranslate}}</span>
                    </button>
                }
            }
            </ng-template>
        </mat-menu>
        <div #trigger style="visibility: hidden; position: fixed" (menuClosed)="onMenuClose()" 
            [matMenuTriggerFor]="listContextMenu">
        </div>
    `,
    imports: [MatMenuModule, MatIconModule, CSTranslatePipe]
})

class ContextMenuComponent {
    private _menuTrigger = viewChild(MatMenuTrigger);
    private _triggerElement = viewChild('trigger', { read: ElementRef });
    contextMenuDirective!: CSContextMenuDirective;

    _open(event: MouseEvent | TouchEvent, args: ConextMenuOpenArgs) {
        const menuTrigger = this._menuTrigger();
        if (!menuTrigger)
            return;

        const _position: { clientX: number, clientY: number } = event instanceof MouseEvent ? event : event.touches[0];
        const triggerElement: HTMLElement = this._triggerElement()?.nativeElement;
        triggerElement.style.left = _position.clientX + 'px';
        triggerElement.style.top = _position.clientY + 'px';

        if (menuTrigger.menuOpen) {
            menuTrigger.updatePosition();
            menuTrigger.menu?.focusFirstItem();
            return;
        }

        this.contextMenuDirective._eventManager.listenAndRegister('lockedDocument', 'document', ['contextmenu', 'click'], () => this._close());

        menuTrigger.menuData = { info: args };
        CSContextMenuTracker.update(menuTrigger);
        menuTrigger.openMenu();
    }

    protected onMenuClose() {
        this.contextMenuDirective._eventManager.unRegister('lockedDocument');
    }

    _close(): void {
        this._menuTrigger()?.closeMenu();
    }
}

@Directive({
    selector: '[csContextMenu]'
})
export class CSContextMenuDirective implements OnDestroy {

    private _elementRef = inject(ElementRef);
    private _renderer = inject(Renderer2);
    private _environmentInjector = inject(EnvironmentInjector);
    private _viewContainerRef = inject(ViewContainerRef);
    private _parent = inject(CODINUS_CONTEXT_MENU_PARENT, { optional: true, self: true });
    _eventManager = createEventManager(this._renderer);

    readonly contextMenuOpen = input<IAction<ConextMenuOpenArgs> | null>(null);
    readonly contextMenuItems = input<IContextMenuItem[] | null>(null);
    readonly csContextMenu = input(false, { transform: booleanAttribute });
    readonly contextMenuClick = output<IContextMenuClickArgs>();
    private _menuComponent?: ComponentRef<ContextMenuComponent>;
    private _parentSubscription: Subscription | OutputRefSubscription | null = null;

    constructor() {
        effect(() => {
            const enabled = this.csContextMenu();
            if (enabled && !this._menuComponent) {
                this._createComponent();
                this._assignEvents();
            } else if (!enabled && this._menuComponent) {
                this._destroyAll();
            }
        });
    }

    private _assignEvents() {
        if (this._parent)
            this._parentSubscription = this._parent.conextMenuOpening
                .subscribe(args => this._onOpenContextMenu(args));
        else
            this._eventManager.listenAndRegister('contextmenu', this._elementRef.nativeElement, 'contextmenu', event => this._onOpenContextMenu({ event }));
    }

    private _createComponent(): void {
        const hostElement = this._renderer.createElement('div');
        this._renderer.appendChild(this._elementRef.nativeElement, hostElement);
        const menuComponent = createComponent(ContextMenuComponent, { environmentInjector: this._environmentInjector, hostElement });
        menuComponent.instance.contextMenuDirective = this;
        this._menuComponent = menuComponent;
        this._viewContainerRef.insert(menuComponent.hostView);
    }

    private _destroyAll() {
        this._parentSubscription?.unsubscribe();
        this._parentSubscription = null;
        this._eventManager.unRegisterAll();
        this._menuComponent?.destroy();
        this._menuComponent = undefined;
    }

    ngOnDestroy(): void {
        this._destroyAll();
    }

    _onContextMenuClick(menuItem: IContextMenuItem, data: unknown) {
        if (!this._menuComponent?.instance)
            return;
        this._menuComponent.instance._close();
        const args: IContextMenuClickArgs = { data, menuItem }
        if (menuItem.action)
            menuItem.action(args);
        else
            this.contextMenuClick.emit(args);
    }

    private _onOpenContextMenu(eventArgs: ConextMenuOpeningArgs): boolean | void {
        if (!this._menuComponent?.instance)
            return;
        eventArgs.event?.preventDefault();
        eventArgs.event?.stopPropagation();
        const menuItems = [...(this.contextMenuItems() ?? [])];
        const args: ConextMenuOpenArgs = { menuItems, data: eventArgs.data };
        this.contextMenuOpen()?.(args);
        if (!args.menuItems?.length)
            return false;

        this._menuComponent.instance._open(eventArgs.event as MouseEvent | TouchEvent, args);

        return false;
    }
}

