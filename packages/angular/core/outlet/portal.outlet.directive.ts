import { CdkPortalOutlet, DomPortal, Portal } from "@angular/cdk/portal";
import { Directive, Input, OnInit, output } from "@angular/core";

@Directive({
    selector: '[csPortalOutlet]',
    exportAs: 'csPortalOutlet'
})
export class CSPortalOutlet extends CdkPortalOutlet implements OnInit {

    readonly detached = output<void>();

    @Input('csPortalOutlet')
    override get portal(): Portal<unknown> | null {
        return this._attachedPortal;
    }
    override set portal(portal: Portal<unknown> | null | undefined | '') {
        if (super.portal == portal)
            return;
        const prevAttached = this.hasAttached();
        const prevPortal = this.portal;
        super.portal = portal;
        if (prevAttached != this.hasAttached() && prevPortal && !this.portal)
            this.detached.emit();
        else if (prevPortal != this.portal && this._attachedPortal instanceof DomPortal)
            this.attached.emit();
    }

    override detach(): void {
        super.detach();
        this.detached.emit();
    }

    override attach(portal: unknown) {
        const attachedResult = super.attach(portal);
        if (this._attachedPortal instanceof DomPortal)
            this.attached.emit();
        return attachedResult;
    }
}