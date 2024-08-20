import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentDetailService } from '../services/payment-detail.service';
import { PaymentDetail } from '../models/payment-detail.model';
import { SharedService } from '../services/shared.service';
import { StatesLgasFacilitiesService } from '../services/states-lgas-facilities.service';
import { State } from '../services/states-lgas-facilities.service';

@Component({
  selector: 'app-payment-detail-list',
  templateUrl: './payment-detail-list.component.html',
  styleUrls: ['./payment-detail-list.component.css'],
})
export class PaymentDetailListComponent implements OnInit {
  fromDate = '';
  toDate = '';
  paymentDetails: PaymentDetail[] = [];
  currentPage = 0;
  pageSize = 15;
  totalPages = 0;
  totalItems = 0;
  sortColumn = 'lastName';
  sortDirection = 'asc';
  searchTerm = '';
  // stateFilter = '';
  // lgaFilter = '';
  // facilityFilter = '';
  teamTypeFilter = '';
  pageSizes = [10, 15, 20, 30, 50];

  states: State[] = [];
  lgas: string[] = [];
  facilities: string[] = [];

  selectedState: string = '';
  selectedLga: string = '';
  selectedFacility: string = '';

  constructor(
    private paymentDetailService: PaymentDetailService,
    private statesLgasFacilitiesService: StatesLgasFacilitiesService
  ) {}

  ngOnInit(): void {
    this.fetchStatesLgasFacilities();
  }

  fetchStatesLgasFacilities(): void {
    this.statesLgasFacilitiesService.getStatesLgasFacilities().subscribe(
      (data: State[]) => {
        this.states = data;
        this.updateLgasAndFacilities();
      },
      (error) => {
        console.error('Error fetching states, LGAs, and facilities:', error);
      }
    );
  }

  updateLgasAndFacilities(): void {
    this.lgas = [];
    this.facilities = [];

    if (this.selectedState) {
      const state = this.states.find((s) => s.state === this.selectedState);
      if (state) {
        this.lgas = state.lgasFacilities.lgas.map((lga) => lga.lga);
      }
    } else {
      this.lgas = this.states.flatMap((state) =>
        state.lgasFacilities.lgas.map((lga) => lga.lga)
      );
    }

    if (this.selectedLga) {
      if (this.selectedState) {
        const state = this.states.find((s) => s.state === this.selectedState);
        if (state) {
          const lga = state.lgasFacilities.lgas.find(
            (l) => l.lga === this.selectedLga
          );
          if (lga) {
            this.facilities = lga.facilities;
          }
        }
      } else {
        for (const state of this.states) {
          const lga = state.lgasFacilities.lgas.find(
            (l) => l.lga === this.selectedLga
          );
          if (lga) {
            this.facilities = lga.facilities;
            break;
          }
        }
      }
    } else if (this.selectedState) {
      this.facilities =
        this.states
          .find((s) => s.state === this.selectedState)
          ?.lgasFacilities.lgas.flatMap((lga) => lga.facilities) || [];
    } else {
      this.facilities = this.states.flatMap((state) =>
        state.lgasFacilities.lgas.flatMap((lga) => lga.facilities)
      );
    }
  }

  onStateChange(): void {
    this.selectedLga = '';
    this.selectedFacility = '';
    this.updateLgasAndFacilities();
    this.onFilter();
  }

  onLgaChange(): void {
    this.selectedFacility = '';
    this.updateLgasAndFacilities();
    this.onFilter();
  }

  onFacilityChange(): void {
    this.onFilter();
  }

  fetchPaymentDetails(): void {
    this.paymentDetailService
      .getPaymentDetails(
        this.fromDate,
        this.toDate,
        this.currentPage,
        this.pageSize,
        // [`${this.sortColumn},${this.sortDirection}`],
        this.searchTerm,
        this.selectedState,
        this.selectedLga,
        this.selectedFacility,
        this.teamTypeFilter
      )
      .subscribe((response) => {
        this.paymentDetails = response.content;
        this.totalItems = response.page.totalElements;
        this.totalPages = response.page.totalPages;
      });
  }

  exportCSV(): void {
    this.paymentDetailService
      .exportPaymentDetailsCSV(
        this.fromDate,
        this.toDate,
        this.searchTerm,
        this.selectedState,
        this.selectedLga,
        this.selectedFacility,
        this.teamTypeFilter
      )
      .subscribe((data) => {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute(
          'download',
          `payment_details_${this.fromDate}_to_${this.toDate}.csv`
        );
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchPaymentDetails();
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.fetchPaymentDetails();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.fetchPaymentDetails();
  }

  onFilter(): void {
    this.currentPage = 0;
    this.fetchPaymentDetails();
  }

  onPageSizeChange() {
    this.currentPage = 0; // Reset to first page when changing page size
    this.fetchPaymentDetails();
  }

  // user-list.component.ts
  trackByPage(index: number, page: number): number {
    return page;
  }

  getPagesArray(): number[] {
    const pagesArray: number[] = [];
    const maxPagesToShow = 5; // Number of pages to show at a time

    // Determine the range of pages to show
    let startPage = Math.max(
      0,
      this.currentPage - Math.floor(maxPagesToShow / 2)
    );
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

    // Adjust start page if we're near the end
    startPage = Math.max(0, endPage - maxPagesToShow + 1);

    // Generate the list of pages to display
    for (let i = startPage; i <= endPage; i++) {
      pagesArray.push(i + 1); // Page numbers are typically 1-indexed
    }

    return pagesArray;
  }

  shouldShowFirstEllipsis(): boolean {
    return this.currentPage > 2 && this.totalPages > 5;
  }

  shouldShowLastEllipsis(): boolean {
    return this.currentPage < this.totalPages - 3 && this.totalPages > 5;
  }

  //New method to get total page count
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
}
