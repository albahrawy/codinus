import {
    computed, createComponent, Directive, effect, EnvironmentInjector, inject,
    Injectable, signal, viewChildren
} from '@angular/core';
import { CSNamedTemplate } from '@ngx-codinus/core/outlet';
import {
    CODINUS_RUNTIME_FORM_COMPONENT_FACTORY,
    ICSFormTemplateProviderComponent, ICSRuntimeFormTemplate
} from './cs-element-base/types';

@Directive()
export abstract class CSFormTemplateProviderComponent implements ICSFormTemplateProviderComponent {
    readonly templates = viewChildren(CSNamedTemplate);
}

@Injectable({ providedIn: 'root' })
export class CSFormTemplateProviderService {

    private _templates = signal<readonly ICSRuntimeFormTemplate[] | null>(null);
    readonly templates = computed(() => this._templates() ?? []);

    constructor() {
        const formComponentFactory = inject(CODINUS_RUNTIME_FORM_COMPONENT_FACTORY);
        const environmentInjector = inject(EnvironmentInjector);
        const componentType = formComponentFactory.getTemplatesComponent();
        if (!componentType)
            return;

        const componentRef = createComponent(componentType, { environmentInjector });

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