import {
    computed, createComponent, Directive, effect, EnvironmentInjector, inject,
    Injectable, Injector, signal, viewChildren
} from '@angular/core';
import { CSNamedTemplate } from '@ngx-codinus/core/outlet';
import { CODINUS_RUNTIME_FORM_COMPONENT_FACTORY, ICSFormTemplateProviderComponent } from './injection-tokens';

@Directive()
export abstract class CSFormTemplateProviderComponent implements ICSFormTemplateProviderComponent {
    readonly templates = viewChildren(CSNamedTemplate);
}

@Injectable({ providedIn: 'root' })
export class CSFormTemplateProviderService {

    private _templates = signal<readonly CSNamedTemplate[] | null>(null);
    readonly templates = computed(() => this._templates() ?? []);

    constructor() {
        const formComponentFactory = inject(CODINUS_RUNTIME_FORM_COMPONENT_FACTORY);
        const environmentInjector = inject(EnvironmentInjector);
        const elementInjector = inject(Injector);
        const componentType = formComponentFactory.getTemplatesComponent();
        if (!componentType)
            return;

        const componentRef = createComponent(componentType, { environmentInjector, elementInjector });

        const effectRef = effect(() => {
            const templates = componentRef.instance.templates();
            if (templates) {
                this._templates.set(templates);
                componentRef.destroy();
                effectRef.destroy();
            }
        }, { manualCleanup: true });
    }
}