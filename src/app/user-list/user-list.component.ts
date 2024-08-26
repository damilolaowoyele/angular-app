import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/User/user.model';
import { State } from '../services/states-lgas-facilities.service';
import { StatesLgasFacilitiesService } from '../services/states-lgas-facilities.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  searchText = '';
  pageSizes = [10, 15, 20, 30, 50]; // Page size options
  sortBy: string = '';

  selectedState = '';
  selectedLga = '';
  selectedFacility = '';
  selectedStatus: string = '';

  states: State[] = [];
  lgas: string[] = [];
  facilities: string[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private statesLgasFacilitiesService: StatesLgasFacilitiesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // this.getUsers();
    this.route.queryParams.subscribe((params) => {
      this.sortBy = params['sortBy'] || '';
      this.getUsers();
    });
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

  getStatusIcon(user: User): string {
    if (user.suspectedDuplicate) {
      return 'bi bi-exclamation-triangle-fill text-warning';
    }
    return user.status === 'Active'
      ? 'bi bi-check-circle-fill text-success'
      : 'bi bi-x-circle-fill text-danger';
  }

  private getUsers() {
    console.log('Fetching users...');
    this.userService
      .getUserList(
        this.currentPage,
        this.pageSize,
        this.searchText,
        this.selectedState,
        this.selectedLga,
        this.selectedFacility,
        this.selectedStatus,
        this.sortBy
      )
      .subscribe({
        next: (response) => {
          this.users = response.content;
          this.totalPages = response.page.totalPages;
          this.totalElements = response.page.totalElements;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching users', error);
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    console.log('Page changed to:', page + 1);
    this.getUsers();
  }

  onSearch() {
    this.currentPage = 0; // Reset to first page when searching
    this.getUsers();
  }

  onFilter() {
    console.log('Filter triggered with status:', this.selectedStatus);
    this.currentPage = 0;
    this.getUsers();
  }

  onPageSizeChange() {
    this.currentPage = 0; // Reset to first page when changing page size
    this.getUsers();
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

  isLastPageButtonVisible(): boolean {
    return this.currentPage < this.totalPages - 3 && this.totalPages > 5;
  }

  updateUser(id: string) {
    this.router.navigate(['update-user', id]);
  }

  deleteUser(id: string) {
    this.userService.deleteUser(id).subscribe((data) => {
      console.log(data);
      this.getUsers();
    });
  }
}
