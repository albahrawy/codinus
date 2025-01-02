import { CanDeactivateFn, MaybeAsync } from "@angular/router";

export interface ICSDirtyComponent {
    canDeactivate: () => MaybeAsync<boolean>;
  }

  export const canDeactivateGuard: CanDeactivateFn<ICSDirtyComponent> = (component: ICSDirtyComponent) => {
    return component.canDeactivate?.() ?? true;
  };