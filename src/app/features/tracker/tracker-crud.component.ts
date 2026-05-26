// import { Component, OnInit, signal, ViewChild, inject } from '@angular/core';
// import { ConfirmationService, MessageService } from 'primeng/api';
// import { Table, TableModule } from 'primeng/table';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { RippleModule } from 'primeng/ripple';
// import { ToastModule } from 'primeng/toast';
// import { ToolbarModule } from 'primeng/toolbar';
// import { InputTextModule } from 'primeng/inputtext';
// import { TextareaModule } from 'primeng/textarea';
// import { SelectModule } from 'primeng/select';
// import { RadioButtonModule } from 'primeng/radiobutton';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { DialogModule } from 'primeng/dialog';
// import { TagModule } from 'primeng/tag';
// import { InputIconModule } from 'primeng/inputicon';
// import { IconFieldModule } from 'primeng/iconfield';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { DatePickerModule } from 'primeng/datepicker';
// import { TrackerService } from './services/tracker.service';
// import { Column, ExportColumn, Transaction } from './models/tracker.model';

// @Component({
//     selector: 'fx-tracker-crud',
//     standalone: true,
//     imports: [
//         CommonModule,
//         TableModule,
//         FormsModule,
//         ButtonModule,
//         RippleModule,
//         ToastModule,
//         ToolbarModule,
//         InputTextModule,
//         TextareaModule,
//         SelectModule,
//         RadioButtonModule,
//         InputNumberModule,
//         DialogModule,
//         TagModule,
//         InputIconModule,
//         IconFieldModule,
//         ConfirmDialogModule,
//         DatePickerModule
//     ],
//     providers: [MessageService, ConfirmationService, TrackerService],
//     template: `
//         <p-toast />

//         <p-toolbar styleClass="mb-6">
//             <ng-template #start>
//                 <p-button label="New Transaction" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
//                 <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedTransactions()" [disabled]="!selectedTransactions || !selectedTransactions.length" />
//             </ng-template>

//             <ng-template #end>
//                 <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
//             </ng-template>
//         </p-toolbar>

//         <p-table
//             #dt
//             [value]="trackerService.transactions()"
//             [rows]="10"
//             [columns]="cols"
//             [paginator]="true"
//             [globalFilterFields]="['title', 'category', 'type', 'paymentMethod']"
//             [tableStyle]="{ 'min-width': '75rem' }"
//             [(selection)]="selectedTransactions"
//             [rowHover]="true"
//             dataKey="id"
//             currentPageReportTemplate="Showing {first} to {last} of {totalRecords} transactions"
//             [showCurrentPageReport]="true"
//             [rowsPerPageOptions]="[10, 20, 30]"
//         >
//             <ng-template #caption>
//                 <div class="flex items-center justify-between">
//                     <h5 class="m-0">Manage Income & Expenses</h5>
//                     <p-iconfield>
//                         <p-inputicon styleClass="pi pi-search" />
//                         <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search transactions..." />
//                     </p-iconfield>
//                 </div>
//             </ng-template>
//             <ng-template #header>
//                 <tr>
//                     <th style="width: 3rem">
//                         <p-tableHeaderCheckbox />
//                     </th>
//                     <th pSortableColumn="date" style="min-width:10rem">Date <p-sortIcon field="date" /></th>
//                     <th pSortableColumn="title" style="min-width: 16rem">Title <p-sortIcon field="title" /></th>
//                     <th pSortableColumn="amount" style="min-width: 10rem">Amount <p-sortIcon field="amount" /></th>
//                     <th pSortableColumn="category" style="min-width:12rem">Category <p-sortIcon field="category" /></th>
//                     <th pSortableColumn="paymentMethod" style="min-width: 12rem">Method <p-sortIcon field="paymentMethod" /></th>
//                     <th pSortableColumn="type" style="min-width: 10rem">Type <p-sortIcon field="type" /></th>
//                     <th style="min-width: 12rem">Action</th>
//                 </tr>
//             </ng-template>
//             <ng-template #body let-transaction>
//                 <tr>
//                     <td>
//                         <p-tableCheckbox [value]="transaction" />
//                     </td>
//                     <td>{{ transaction.date | date: 'dd MMM yyyy' }}</td>
//                     <td class="font-medium">{{ transaction.title }}</td>
//                     <td class="font-semibold">{{ transaction.amount | currency: 'BDT' : 'symbol' : '1.0-0' }}</td>
//                     <td>{{ transaction.category }}</td>
//                     <td>{{ transaction.paymentMethod }}</td>
//                     <td>
//                         <p-tag [value]="transaction.type" [severity]="getSeverity(transaction.type)" />
//                     </td>
//                     <td>
//                         <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editTransaction(transaction)" />
//                         <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteTransaction(transaction)" />
//                     </td>
//                 </tr>
//             </ng-template>
//         </p-table>

//         <p-dialog [(visible)]="transactionDialog" [style]="{ width: '700px' }" header="Transaction Details" [modal]="true">
//             <ng-template #content>
//                 <div class="flex flex-col gap-6">
//                     <div>
//                         <span class="block font-bold mb-4">Transaction Type</span>
//                         <div class="grid grid-cols-12 gap-4">
//                             <div class="flex items-center gap-2 col-span-6">
//                                 <p-radiobutton id="typeExpense" name="type" value="EXPENSE" [(ngModel)]="transaction.type" (onClick)="onTypeChange()" />
//                                 <label for="typeExpense" class="text-red-500 font-semibold">Expense</label>
//                             </div>
//                             <div class="flex items-center gap-2 col-span-6">
//                                 <p-radiobutton id="typeIncome" name="type" value="INCOME" [(ngModel)]="transaction.type" (onClick)="onTypeChange()" />
//                                 <label for="typeIncome" class="text-emerald-500 font-semibold">Income</label>
//                             </div>
//                         </div>
//                     </div>

//                     <div>
//                         <label for="title" class="block font-bold mb-3">Title</label>
//                         <input type="text" pInputText id="title" [(ngModel)]="transaction.title" required autofocus fluid placeholder="e.g., Office Salary" />
//                         <small class="text-red-500" *ngIf="submitted && !transaction.title">Title is required.</small>
//                     </div>

//                     <div class="grid grid-cols-12 gap-4">
//                         <div class="col-span-6">
//                             <label for="amount" class="block font-bold mb-3">Amount</label>
//                             <p-inputnumber id="amount" [(ngModel)]="transaction.amount" mode="currency" currency="BDT" locale="en-BD" fluid required />
//                             <small class="text-red-500" *ngIf="submitted && !transaction.amount">Required.</small>
//                         </div>
//                         <div class="col-span-6">
//                             <label for="date" class="block font-bold mb-3">Date</label>
//                             <p-datepicker id="date" [(ngModel)]="transaction.date" dateFormat="yy-mm-dd" [showIcon]="true" fluid />
//                         </div>
//                     </div>

//                     <!-- সার্ভিসের রিঅ্যাক্টিভ সিগন্যাল থেকে ডাইনামিক ক্যাটাগরি পপুলেট -->
//                     <div>
//                         <label for="category" class="block font-bold mb-3">Category</label>
//                         <p-select [(ngModel)]="transaction.category" inputId="category" [options]="availableCategories" placeholder="Select a Category" fluid />
//                     </div>

//                     <!-- সার্ভিসের রিঅ্যাক্টিভ সিগন্যাল থেকে পেমেন্ট মেথড এনাম লোড -->
//                     <div>
//                         <label for="paymentMethod" class="block font-bold mb-3">Payment Method</label>
//                         <p-select [(ngModel)]="transaction.paymentMethod" inputId="paymentMethod" [options]="trackerService.paymentMethods()" placeholder="Select Payment Method" fluid />
//                     </div>

//                     <div>
//                         <label for="remarks" class="block font-bold mb-3">Remarks</label>
//                         <textarea id="remarks" pTextarea [(ngModel)]="transaction.remarks" rows="2" cols="20" fluid placeholder="Optional notes..."></textarea>
//                     </div>
//                 </div>
//             </ng-template>

//             <ng-template #footer>
//                 <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
//                 <p-button label="Save" icon="pi pi-check" (click)="saveTransaction()" />
//             </ng-template>
//         </p-dialog>

//         <p-confirmdialog [style]="{ width: '450px' }" />
//     `
// })
// export class TrackerCrudComponent implements OnInit {
//     // ডাইনামিক সার্ভিস ইনজেকশন
//     public trackerService = inject(TrackerService);
//     private messageService = inject(MessageService);
//     private confirmationService = inject(ConfirmationService);

//     transactionDialog: boolean = false;
//     transaction!: Transaction;
//     selectedTransactions!: Transaction[] | null;
//     submitted: boolean = false;
//     availableCategories: string[] = [];

//     @ViewChild('dt') dt!: Table;
//     exportColumns!: ExportColumn[];
//     cols!: Column[];

//     ngOnInit() {
//         this.initializeComponent();
//     }

//     async initializeComponent() {
//         // প্রথমে সার্ভিস দিয়ে JSON ডেটা ফেচ সম্পন্ন করা হচ্ছে
//         await this.trackerService.loadTrackerMetaData();

//         this.cols = [
//             { field: 'date', header: 'Date' },
//             { field: 'title', header: 'Title' },
//             { field: 'amount', header: 'Amount' },
//             { field: 'category', header: 'Category' },
//             { field: 'paymentMethod', header: 'Method' },
//             { field: 'type', header: 'Type' }
//         ];

//         this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

//         // ডিফল্ট ক্যাটাগরি সিঙ্ক
//         this.availableCategories = [...this.trackerService.expenseCategories()];
//     }

//     onTypeChange() {
//         // ডাইনামিক সিগন্যাল সোর্স থেকে ক্যাটাগরি ফিল্টার
//         this.availableCategories = this.transaction.type === 'INCOME' ? this.trackerService.incomeCategories() : this.trackerService.expenseCategories();
//         this.transaction.category = '';
//     }

//     exportCSV() {
//         this.dt.exportCSV();
//     }

//     onGlobalFilter(table: Table, event: Event) {
//         table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
//     }

//     openNew() {
//         this.transaction = {
//             type: 'EXPENSE',
//             date: new Date().toISOString().substring(0, 10),
//             paymentMethod: (this.trackerService.paymentMethods()[0] || 'CASH') as 'CASH' | 'BANK' | 'MOBILE_BANKING'
//         };
//         this.onTypeChange();
//         this.submitted = false;
//         this.transactionDialog = true;
//     }

//     editTransaction(txn: Transaction) {
//         this.transaction = { ...txn };
//         this.availableCategories = this.transaction.type === 'INCOME' ? this.trackerService.incomeCategories() : this.trackerService.expenseCategories();
//         this.transactionDialog = true;
//     }

//     deleteSelectedTransactions() {
//         this.confirmationService.confirm({
//             message: 'Are you sure you want to delete the selected transactions?',
//             header: 'Confirm Delete',
//             icon: 'pi pi-exclamation-triangle',
//             accept: () => {
//                 const updatedTxns = this.trackerService.transactions().filter((val) => !this.selectedTransactions?.includes(val));
//                 this.trackerService.transactions.set(updatedTxns);
//                 this.selectedTransactions = null;
//                 this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transactions Deleted', life: 3000 });
//             }
//         });
//     }

//     deleteTransaction(txn: Transaction) {
//         this.confirmationService.confirm({
//             message: 'Are you sure you want to delete this entry: ' + txn.title + '?',
//             header: 'Confirm Delete',
//             icon: 'pi pi-exclamation-triangle',
//             accept: () => {
//                 const updatedTxns = this.trackerService.transactions().filter((val) => val.id !== txn.id);
//                 this.trackerService.transactions.set(updatedTxns);
//                 this.transaction = {};
//                 this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Entry Deleted', life: 3000 });
//             }
//         });
//     }

//     hideDialog() {
//         this.transactionDialog = false;
//         this.submitted = false;
//     }

//     getSeverity(type: string | undefined) {
//         return type === 'INCOME' ? 'success' : 'danger';
//     }

//     saveTransaction() {
//         this.submitted = true;
//         let _txns = this.trackerService.transactions();

//         if (this.transaction.title?.trim() && this.transaction.amount) {
//             if ((this.transaction.date as any) instanceof Date) {
//                 this.transaction.date = (this.transaction.date as unknown as Date).toISOString().substring(0, 10);
//             }

//             if (this.transaction.id) {
//                 const index = _txns.findIndex((t) => t.id === this.transaction.id);
//                 _txns[index] = this.transaction;
//                 this.trackerService.transactions.set([..._txns]);
//                 this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transaction Updated', life: 3000 });
//             } else {
//                 this.transaction.id = 'TXN' + Math.floor(1000 + Math.random() * 9000);
//                 this.trackerService.transactions.set([this.transaction, ..._txns]);
//                 this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transaction Created', life: 3000 });
//             }

//             this.transactionDialog = false;
//             this.transaction = {};
//         }
//     }
// }

import { Component, OnInit, inject } from '@angular/core';
import { TrackerService } from './services/tracker.service';
import { DynamicTableComponent } from '@/app/shared/components/dynamic-table.component';
import { TableActionClickEvent, TableColumn, TableSettings } from '@/app/shared/models/dynamic-table.interface';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'fx-tracker-crud',
    standalone: true,
    imports: [DynamicTableComponent, CommonModule],
    providers: [TrackerService],
    template: `
        <!-- সেটিংস অবজেক্টটি পুরোপুরি রেডি না হওয়া পর্যন্ত টেবিলটি ডমে আসবে না -->
        <div class="card" *ngIf="tableSettings && tableSettings.title">
            <fx-dynamic-table
                [data]="trackerService.transactions()"
                [columns]="tableCols"
                [settings]="tableSettings"
                (addClick)="openAddTransactionDialog()"
                (bulkDeleteClick)="deleteSelectedTransactions($event)"
                (actionClick)="handleTableAction($event)"
            >
            </fx-dynamic-table>
        </div>
    `
})
export class TrackerCrudComponent implements OnInit {
    public trackerService = inject(TrackerService);
    tableCols: TableColumn[] = [];
    tableSettings: TableSettings = {};

    ngOnInit() {
        this.setupTable();
        this.trackerService.loadTrackerMetaData();
    }

    setupTable() {
        // ১. কলাম সেটিংস
        this.tableCols = [
            { field: 'date', header: 'Date', type: 'date' },
            { field: 'title', header: 'Title' },
            { field: 'amount', header: 'Amount', type: 'currency' },
            { field: 'category', header: 'Category' },
            { field: 'type', header: 'Type', type: 'tag', tagSeverity: (val) => (val === 'INCOME' ? 'success' : 'danger') }
        ];

        // ২. মাস্টার টেবিল সেটিংস (এখান থেকেই সবকিছু সুইচ হবে)
        this.tableSettings = {
            title: 'Financial Statements Ledger',
            // showSearch: true,
            // searchPlaceholder: 'Search transactions...',
            // globalFilterFields: ['title', 'category'],
            // showExport: true,
            // showSelection: true,
            showPaginator: true,
            rowsPerPage: 10,
            addButton: { show: true, label: 'Add' },
            bulkDeleteButton: { show: true, label: 'Delete Selected' },
            actions: {
                show: true,
                edit: true,
                delete: true,
                customActions: [
                    //{ id: 'receipt', icon: 'pi pi-file-pdf', severity: 'info' }
                ]
            }
        };
    }

    handleTableAction(event: TableActionClickEvent) {
        switch (event.action) {
            case 'edit':
                // ওপেন এডিট ডায়ালগ লজিক
                break;
            case 'delete':
                // ডিলিট কনফার্মেশন লজিক
                break;
            case 'receipt':
                console.log('Downloading PDF Receipt for:', event.data);
                break;
        }
    }

    handleSelection(selectedRows: any[]) {
        console.log('Selected Rows Matrix:', selectedRows);
    }

    openAddTransactionDialog() {
        console.log('Opening Dynamic Dialog or Modal to add new transaction...');
        // এখানে আপনার PrimeNG Dialog বা কম্পোনেন্ট ওপেন করার লজিক আসবে
    }

    deleteSelectedTransactions(selectedItems: any[]) {
        console.log('আইটেম যেগুলো ডিলিট হবে:', selectedItems);
        // আপনার ConfirmationService দিয়ে ডায়ালগ দেখিয়ে তারপর API কল করুন
        // ডিলিট সফল হওয়ার পর টেবিলের `selectedItems` ক্লিয়ার করতে কম্পোনেন্টের একটা রেফারেন্স বা রিফ্রেশ মেথড কল করতে পারেন।
    }
}
