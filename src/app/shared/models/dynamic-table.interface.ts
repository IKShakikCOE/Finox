export interface TableColumn {
    field: string;
    header: string;
    type?: 'text' | 'date' | 'currency' | 'tag';
    tagSeverity?: (value: any) => 'success' | 'danger' | 'info' | 'warn' | 'secondary';
}

export interface TableSettings {
    title?: string;

    showSearch?: boolean;
    searchPlaceholder?: string;
    globalFilterFields?: string[];

    showExport?: boolean;
    
    showSelection?: boolean;

    showPaginator?: boolean;
    rowsPerPage?: number;
    rowsPerPageOptions?: number[];

    addButton?: {
        show: boolean;
        label?: string;
        icon?: string;
    };

    bulkDeleteButton?: {
        show: boolean;
        label?: string;
        icon?: string;
    };
    actions?: {
        show?: boolean;
        edit?: boolean;
        delete?: boolean;
        customActions?: { id: string; icon: string; severity?: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'help' | 'contrast'; tooltip?: string }[];
    };
}

export interface TableActionClickEvent {
    action: 'edit' | 'delete' | string;
    data: any;
}
