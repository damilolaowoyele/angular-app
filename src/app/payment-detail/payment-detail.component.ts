// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-payment-detail',
//   template: `
//     <div class="container">
//       <h1>Payment Details</h1>
//       <app-payment-detail-list></app-payment-detail-list>
//     </div>
//   `,
//   styleUrls: ['./payment-detail.component.css'],
// })
// export class PaymentDetailComponent implements OnInit {
//   constructor() {}

//   ngOnInit(): void {}
// }

//MAIN
// import { Component, OnInit } from '@angular/core';
// import { PaymentDetailService } from '../services/payment-detail.service';
// import { SharedService } from '../services/shared.service';

// @Component({
//   selector: 'app-payment-detail',
//   templateUrl: './payment-detail.component.html',
//   styleUrls: ['./payment-detail.component.css'],
// })
// export class PaymentDetailComponent implements OnInit {
//   fromDate!: string;
//   toDate!: string;

//   constructor(
//     private paymentDetailService: PaymentDetailService,
//     private sharedService: SharedService
//   ) {}

//   ngOnInit(): void {}

//   fetchPaymentDetails(): void {
//     this.paymentDetailService
//       .getPaymentDetails(this.fromDate, this.toDate)
//       .subscribe((paymentDetails) => {
//         // Assuming there's a way to pass these details to the payment-detail-list component
//         // This could be via a shared service, direct component interaction, or state management
//         this.sharedService.updatePaymentDetails(paymentDetails);
//       });
//   }

//   exportCSV(): void {
//     this.paymentDetailService
//       .exportPaymentDetailsCSV(this.fromDate, this.toDate)
//       .subscribe((data) => {
//         const blob = new Blob([data], { type: 'text/csv' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.setAttribute('hidden', '');
//         a.setAttribute('href', url);
//         a.setAttribute(
//           'download',
//           `payment_details_${this.fromDate}_to_${this.toDate}.csv`
//         );
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//       });
//   }
// }
