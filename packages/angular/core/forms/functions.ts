import { ICSFormSection } from "./directives/injector-tokens";

export function isFormSection(value: unknown): value is ICSFormSection {
    return value != null && (value as { _isFormSection: boolean })._isFormSection;
}
