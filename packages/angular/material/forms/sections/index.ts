import { CSFormArea } from './cs-form-area/cs-form-area';
import { CSFormAreaPanel } from './cs-form-area/cs-form-area-panel';
import { CSFormSection } from './cs-form-section';
import { CSFormSectionArray } from './cs-form-section-array/cs-form-section-array';
import { CSFormSectionArrayContent } from './cs-form-section-array/cs-form-section-content';
import { CSFormSectionTree } from './cs-form-section-array/cs-form-section-tree';
import { CSLocalizableInput } from './cs-localizable-input/cs-localizable-input';

export * from './cs-form';
export * from './cs-form-area/cs-form-area';
export * from './cs-form-area/cs-form-area-panel';
export * from './cs-form-section';
export * from './cs-form-section-array/cs-form-section-array';
export * from './cs-form-section-array/cs-form-section-content';
export * from './cs-form-section-array/cs-form-section-tree';
export * from './cs-localizable-input/cs-localizable-input';
export * from './types';

export const CODINUS_FORM_AREA = [CSFormAreaPanel, CSFormArea] as const;
export const CODINUS_FORM_SECTIONS = [CSFormSection, CSLocalizableInput,
    CSFormSectionArray, CSFormSectionTree, CSFormSectionArrayContent, ...CODINUS_FORM_AREA] as const;
