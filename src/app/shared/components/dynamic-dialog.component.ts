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
        DatePickerModule
    ],
    template: `
        <p-dialog
            [(visible)]="visible"
            [style]="{ width: config.width || '700px' }"
            [header]="config.header"
            [modal]="true"
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
                            <p-inputnumber [id]="field.key" [(ngModel)]="formData[field.key]" fluid />
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
                            <p-select
                                [(ngModel)]="formData[field.key]"
                                [inputId]="field.key"
                                [options]="resolveOptions(field)"
                                [placeholder]="field.placeholder || 'Select...'"
                                fluid
                            />
                        </div>

                        <!-- Radio buttons -->
                        <div *ngSwitchCase="'radio'">
                            <span class="block font-bold mb-4">{{ field.label }}</span>
                            <div class="grid grid-cols-12 gap-4">
                                <div *ngFor="let opt of resolveOptions(field); let i = index" class="flex items-center gap-2 col-span-6">
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
