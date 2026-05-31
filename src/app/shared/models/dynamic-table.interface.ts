export interface TableColumn {
    field: string;
    header: string;
    type?: 'text' | 'date' | 'currency' | 'tag' | 'icon' | 'color' | 'category';
    tagSeverity?: (value: any) => 'success' | 'danger' | 'info' | 'warn' | 'secondary';
}

export interface TableAction {
    show: boolean;
    label: string;
    icon: string;
    severity?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined;
    action: 'view' | 'edit' | 'delete' | 'custom' | string;
}

export interface DialogField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'currency' | 'select' | 'grouped-select' | 'dependent-select' | 'radio' | 'date' | 'color';
    placeholder?: string;
    required?: boolean;
    options?: any[] | (() => any[]);
    /** For dependent-select: function that receives formData and returns filtered options */
    dependentOptions?: (formData: Record<string, any>) => any[];
    /** Column span out of 12 grid (default: 12 = full width) */
    colSpan?: number;
    /** Currency code for 'currency' type fields */
    currency?: string;
    /** Locale for 'currency' type fields */
    locale?: string;
    /** Date format for 'date' type fields */
    dateFormat?: string;
    /** Show calendar icon for 'date' type fields */
    showIcon?: boolean;
    /** Custom CSS class for the radio label */
    labelClass?: string;
    /** Callback when value changes */
    onChange?: (value: any, formData: Record<string, any>) => void;
    /** For grouped-select: the field name for group label (default: 'name') */
    optionGroupLabel?: string;
    /** For grouped-select: the field name for group children array (default: 'children') */
    optionGroupChildren?: string;
    /** For select/grouped-select/dependent-select: the field name for option label */
    optionLabel?: string;
    /** For select/grouped-select/dependent-select: the field name for option value */
    optionValue?: string;
    /** For number: minimum value */
    min?: number;
    /** For number: maximum value */
    max?: number;
    /** For select: enable search/filter in dropdown */
    filter?: boolean;
}

export interface DialogConfig {
    header: string;
    width?: string;
    fields: DialogField[];
}

export interface DialogSaveEvent {
    data: Record<string, any>;
    isNew: boolean;
}

export interface TableSettings {
    endpoint: string;
    title?: string;
    dataKey?: string;
    columns?: TableColumn[];
    actions?: TableAction[];
    dialogConfig?: DialogConfig;

    features?: {
        add: boolean;
        action: boolean;
        bulkDelete: boolean;
        export: boolean;
        selection: boolean;
        pagination: {
            show: boolean;
            rowsPerPageOptions: number[];
            defaultRowsPerPage: number;
        };
        search: {
            show: boolean;
            placeholder: string;
            globalFilterFields: string[];
        };
    };
}

export interface TableActionClickEvent {
    action: 'edit' | 'delete' | string;
    data: any;
}
