import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogConfig, DialogField, DialogSaveEvent } from '../models/dynamic-table.interface';

@Component({
    selector: 'fx-dynamic-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
        InputNumberModule,
        SelectModule,
        RadioButtonModule,
        DatePickerModule,
        ColorPickerModule
    ],
    template: `
        <p-dialog
            [(visible)]="visible"
            [style]="{ width: config.width || '900px', overflow: 'visible' }"
            [header]="config.header"
            [modal]="true"
            [contentStyle]="{ overflow: 'visible' }"
            (onHide)="onCancel()"
        >
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <ng-container *ngFor="let field of config.fields">
                        <!-- Full-width fields -->
                        <ng-container *ngIf="!field.colSpan || field.colSpan === 12">
                            <ng-container *ngTemplateOutlet="fieldTemplate; context: { $implicit: field }" />
                        </ng-container>
                    </ng-container>

                    <!-- Grouped fields (colSpan < 12) rendered in grid rows -->
                    <ng-container *ngIf="hasGridFields()">
                        <div class="grid grid-cols-12 gap-4">
                            <ng-container *ngFor="let field of getGridFields()">
                                <div [class]="'col-span-' + (field.colSpan || 6)">
                                    <ng-container *ngTemplateOutlet="fieldTemplate; context: { $implicit: field }" />
                                </div>
                            </ng-container>
                        </div>
                    </ng-container>
                </div>

                <!-- Field rendering template -->
                <ng-template #fieldTemplate let-field>
                    <div [ngSwitch]="field.type">
                        <!-- Text input -->
                        <div *ngSwitchCase="'text'">
                            <label [for]="field.key" class="block font-bold mb-3">{{ field.label }}</label>
                            <input
                                type="text"
                                pInputText
                                [id]="field.key"
                                [(ngModel)]="formData[field.key]"
                                [placeholder]="field.placeholder || ''"
                                fluid
                            />
                            <small class="text-red-500" *ngIf="submitted && field.required && !formData[field.key]">
                                {{ field.label }} is required.
                            </small>
                        </div>

                        <!-- Textarea -->
                        <div *ngSwitchCase="'textarea'">
                            <label [for]="field.key" class="block font-bold mb-3">{{ field.label }}</label>
                            <textarea
                                [id]="field.key"
                                pTextarea
                                [(ngModel)]="formData[field.key]"
                                rows="2"
                                cols="20"
                                fluid
                                [placeholder]="field.placeholder || ''"
                            ></textarea>
                        </div>

                        <!-- Number input -->
                        <div *ngSwitchCase="'number'">
                            <label [for]="field.key" class="block font-bold mb-3">{{ field.label }}</label>
                            <p-inputnumber [id]="field.key" [(ngModel)]="formData[field.key]" [min]="field.min ?? null" [max]="field.max ?? null" fluid />
                            <small class="text-red-500" *ngIf="submitted && field.required && !formData[field.key]">
                                {{ field.label }} is required.
                            </small>
                        </div>

                        <!-- Currency input -->
                        <div *ngSwitchCase="'currency'">
                            <label [for]="field.key" class="block font-bold mb-3">{{ field.label }}</label>
                            <p-inputnumber
                                [id]="field.key"
                                [(ngModel)]="formData[field.key]"
                                mode="currency"
                                [currency]="field.currency || 'USD'"
                                [locale]="field.locale || 'en-US'"
                                fluid
                            />
                            <small class="text-red-500" *ngIf="submitted && field.required && !formData[field.key]">
                                {{ field.label }} is required.
                            </small>
                        </div>

                        <!-- Select dropdown -->
                        <div *ngSwitchCase="'select'">
                            <label [for]="field.key" class="block font-bold mb-3">{{ field.label }}</label>
                            <ng-container *ngIf="field.optionLabel; else plainSelect">
                                <p-select
                                    [(ngModel)]="formData[field.key]"
                                    [inputId]="field.key"
                                    [options]="resolveOptions(field)"
                                    [optionLabel]="field.optionLabel"
                                    [optionValue]="field.optionValue"
                                    [placeholder]="field.placeholder || 'Select...'"
                                    [filter]="field.filter || false"
                                    (onChange)="onFieldChange(field)"
                                    fluid
                                >
                                    <ng-template let-item pTemplate="item">
                                        <div class="flex items-center gap-2">
                                            <span *ngIf="item.color" [style.background-color]="item.color" style="width: 10px; height: 10px; border-radius: 50%; display: inline-block"></span>
                                            <i *ngIf="item.icon" [class]="'pi ' + item.icon" [style.color]="item.color || 'inherit'" style="font-size: 0.9rem"></i>
                                            <span>{{ item[field.optionLabel || 'name'] }}</span>
                                        </div>
                                    </ng-template>
                                    <ng-template let-item pTemplate="selectedItem">
                                        <div class="flex items-center gap-2" *ngIf="item">
                                            <span *ngIf="item.color" [style.background-color]="item.color" style="width: 10px; height: 10px; border-radius: 50%; display: inline-block"></span>
                                            <i *ngIf="item.icon" [class]="'pi ' + item.icon" [style.color]="item.color || 'inherit'" style="font-size: 0.9rem"></i>
                                            <span>{{ item[field.optionLabel || 'name'] }}</span>
                                        </div>
                                    </ng-template>
                                </p-select>
                            </ng-container>
                            <ng-template #plainSelect>
                                <p-select
                                    [(ngModel)]="formData[field.key]"
                                    [inputId]="field.key"
                                    [options]="resolveOptions(field)"
                                    [placeholder]="field.placeholder || 'Select...'"
                                    [filter]="field.filter || false"
                                    (onChange)="onFieldChange(field)"
                                    fluid
                                />
                            </ng-template>
                        </div>

                        <!-- Grouped select dropdown (categories with parent headers) -->
                        <div *ngSwitchCase="'grouped-select'">
                            <label [for]="field.key" class="block font-bold mb-3">{{ field.label }}</label>
                            <p-select
                                [(ngModel)]="formData[field.key]"
                                [inputId]="field.key"
                                [options]="resolveOptions(field)"
                                [optionLabel]="field.optionLabel || 'name'"
                                [optionValue]="field.optionValue || 'id'"
                                [optionGroupLabel]="field.optionGroupLabel || 'name'"
                                [optionGroupChildren]="field.optionGroupChildren || 'children'"
                                [group]="true"
                                [placeholder]="field.placeholder || 'Select...'"
                                [filter]="true"
                                filterBy="name"
                                fluid
                            />
                        </div>

                        <!-- Dependent select: second dropdown filtered by first (e.g., parent → child category) -->
                        <div *ngSwitchCase="'dependent-select'">
                            <label [for]="field.key" class="block font-bold mb-3">{{ field.label }}</label>
                            <p-select
                                [(ngModel)]="formData[field.key]"
                                [inputId]="field.key"
                                [options]="resolveDependentOptions(field)"
                                [optionLabel]="field.optionLabel || 'name'"
                                [optionValue]="field.optionValue || 'id'"
                                [placeholder]="field.placeholder || 'Select...'"
                                [disabled]="!resolveDependentOptions(field).length"
                                fluid
                            >
                                <ng-template let-item pTemplate="item">
                                    <div class="flex items-center gap-2">
                                        <span *ngIf="item.color" [style.background-color]="item.color" style="width: 10px; height: 10px; border-radius: 50%; display: inline-block"></span>
                                        <i *ngIf="item.icon" [class]="'pi ' + item.icon" [style.color]="item.color || 'inherit'" style="font-size: 0.9rem"></i>
                                        <span>{{ item.name }}</span>
                                    </div>
                                </ng-template>
                                <ng-template let-item pTemplate="selectedItem">
                                    <div class="flex items-center gap-2" *ngIf="item">
                                        <span *ngIf="item.color" [style.background-color]="item.color" style="width: 10px; height: 10px; border-radius: 50%; display: inline-block"></span>
                                        <i *ngIf="item.icon" [class]="'pi ' + item.icon" [style.color]="item.color || 'inherit'" style="font-size: 0.9rem"></i>
                                        <span>{{ item.name }}</span>
                                    </div>
                                </ng-template>
                            </p-select>
                        </div>

                        <!-- Radio buttons -->
                        <div *ngSwitchCase="'radio'">
                            <span class="block font-bold mb-4">{{ field.label }}</span>
                            <div class="flex flex-wrap gap-4">
                                <div *ngFor="let opt of resolveOptions(field); let i = index" class="flex items-center gap-2">
                                    <p-radiobutton
                                        [inputId]="field.key + '_' + i"
                                        [name]="field.key"
                                        [value]="getOptionValue(opt)"
                                        [(ngModel)]="formData[field.key]"
                                        (onClick)="onFieldChange(field)"
                                    />
                                    <label [for]="field.key + '_' + i" [class]="getOptionLabelClass(opt)">
                                        {{ getOptionLabel(opt) }}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Date picker -->
                        <div *ngSwitchCase="'date'">
                            <label [for]="field.key" class="block font-bold mb-3">{{ field.label }}</label>
                            <p-datepicker
                                [id]="field.key"
                                [(ngModel)]="formData[field.key]"
                                [dateFormat]="field.dateFormat || 'yy-mm-dd'"
                                [showIcon]="field.showIcon !== false"
                                fluid
                            />
                        </div>

                        <!-- Color picker -->
                        <div *ngSwitchCase="'color'">
                            <label [for]="field.key" class="block font-bold mb-3">{{ field.label }}</label>
                            <div class="flex items-center gap-3">
                                <p-colorpicker [id]="field.key" [(ngModel)]="formData[field.key]" />
                                <span *ngIf="formData[field.key]" class="inline-flex items-center gap-2">
                                    <span [style.background-color]="'#' + formData[field.key]" style="width: 24px; height: 24px; border-radius: 4px; display: inline-block; border: 1px solid #ccc"></span>
                                    <span class="text-sm font-mono">#{{ formData[field.key] }}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="onCancel()" />
                <p-button label="Save" icon="pi pi-check" (click)="onSave()" />
            </ng-template>
        </p-dialog>
    `
})
export class DynamicDialogComponent {
    @Input() config: DialogConfig = { header: '', fields: [] };
    @Input() visible: boolean = false;
    @Input() formData: Record<string, any> = {};
    @Input() isNew: boolean = true;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() save = new EventEmitter<DialogSaveEvent>();
    @Output() cancel = new EventEmitter<void>();

    submitted: boolean = false;

    resolveOptions(field: DialogField): any[] {
        if (typeof field.options === 'function') {
            return field.options();
        }
        return field.options || [];
    }

    /** For dependent-select: resolves options based on another field's current value */
    resolveDependentOptions(field: DialogField): any[] {
        if (typeof field.dependentOptions === 'function') {
            return field.dependentOptions(this.formData);
        }
        return [];
    }

    getOptionValue(opt: any): any {
        return typeof opt === 'object' ? opt.value : opt;
    }

    getOptionLabel(opt: any): string {
        return typeof opt === 'object' ? opt.label : opt;
    }

    getOptionLabelClass(opt: any): string {
        return typeof opt === 'object' ? (opt.labelClass || '') : '';
    }

    hasGridFields(): boolean {
        return this.config.fields.some(f => f.colSpan && f.colSpan < 12);
    }

    getGridFields(): DialogField[] {
        return this.config.fields.filter(f => f.colSpan && f.colSpan < 12);
    }

    onFieldChange(field: DialogField) {
        if (field.onChange) {
            field.onChange(this.formData[field.key], this.formData);
        }
    }

    onSave() {
        this.submitted = true;

        // Validate required fields
        const hasErrors = this.config.fields.some(f => f.required && !this.formData[f.key]);
        if (hasErrors) {
            return;
        }

        this.save.emit({ data: { ...this.formData }, isNew: this.isNew });
        this.submitted = false;
        this.visible = false;
        this.visibleChange.emit(false);
    }

    onCancel() {
        this.submitted = false;
        this.visible = false;
        this.visibleChange.emit(false);
        this.cancel.emit();
    }
}
