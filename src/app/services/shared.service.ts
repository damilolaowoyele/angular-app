import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PaymentDetail } from '../models/payment-detail.model';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private paymentDetailsSource = new BehaviorSubject<PaymentDetail[]>([]);
  currentPaymentDetails = this.paymentDetailsSource.asObservable();

  constructor() {}

  updatePaymentDetails(paymentDetails: PaymentDetail[]) {
    this.paymentDetailsSource.next(paymentDetails);
  }
}
