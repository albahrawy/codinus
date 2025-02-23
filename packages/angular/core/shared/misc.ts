import { _getFocusedElementPierceShadowDom } from "@angular/cdk/platform";
import { Nullable } from "@codinus/types";
import { animationFrameScheduler, asapScheduler } from 'rxjs';

export function containsFocus(element: HTMLElement): boolean {
  const activeElement = _getFocusedElementPierceShadowDom();
  return activeElement != null && element.contains(activeElement);
}

export const SMOOTH_SCHEDULER =
  typeof requestAnimationFrame !== 'undefined' ? animationFrameScheduler : asapScheduler;


export function booleanTrueAttribute(value: Nullable<boolean> | string): boolean {
  return typeof value === 'boolean' ? value : value !== 'false';
}