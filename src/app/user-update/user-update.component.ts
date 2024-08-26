import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/User/user.model';
import { StatesLgasFacilitiesService } from '../services/states-lgas-facilities.service';
import { UserInactivityService } from '../services/user-inactivity.service';
import {
  State,
  LgaFacilitiesSet,
} from '../services/states-lgas-facilities.service';

declare var bootstrap: any;

@Component({
  selector: 'app-user-update',
  templateUrl: './user-update.component.html',
  styleUrls: ['./user-update.component.css'],
})
export class UserUpdateComponent implements OnInit, AfterViewInit {
  id!: string;
  user: User = new User();
  states: State[] = [];
  lgas: string[] = [];
  facilities: string[] = [];
  inactivities: any[] = [];
  newInactivity: any = { startDate: '', endDate: '' };
  userInactivityModal: any;

  @ViewChild('errorModal') errorModal!: ElementRef;
  @ViewChild('errorMessage') errorMessage!: ElementRef;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private statesLgasFacilitiesService: StatesLgasFacilitiesService,
    private userInactivityService: UserInactivityService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getUserById();
    this.fetchStates();
    this.fetchInactivities();
  }

  ngAfterViewInit(): void {
    // Initialize Bootstrap modal if needed
    this.userInactivityModal = new bootstrap.Modal(
      this.errorModal.nativeElement
    );
  }

  private getUserById() {
    this.userService.getUserById(this.id).subscribe({
      next: (data) => {
        this.user = data;
        this.onStateChange();
        this.onLgaChange();
      },
      error: (e) => {
        console.log(e);
        this.openErrorModal('Failed to load user data');
      },
    });
  }

  fetchStates(): void {
    this.statesLgasFacilitiesService.getStatesLgasFacilities().subscribe({
      next: (response) => {
        this.states = response;
        // Ensure that the state and LGA dropdowns are populated if the user has existing values
        if (this.user.state) {
          this.onStateChange();
        }
        if (this.user.lga) {
          this.onLgaChange();
        }
      },
      error: (error) => {
        console.log('Error fetching states, LGAs, and facilities:', error);
        this.openErrorModal('Failed to load states, LGAs, and facilities');
      },
    });
  }

  fetchInactivities(): void {
    this.userInactivityService.getInactivitiesByUserId(this.id).subscribe({
      next: (data) => {
        this.inactivities = data;
      },
      error: (e) => {
        console.log(e);
        this.openErrorModal('Failed to load inactivity periods');
      },
    });
  }

  addInactivity(): void {
    const inactivity = {
      employee: { id: this.id },
      startDate: this.newInactivity.startDate,
      endDate: this.newInactivity.endDate,
    };

    // console.log('Adding inactivity:', inactivity); // Log the request payload

    this.userInactivityService.addInactivity(inactivity).subscribe({
      next: (data) => {
        this.inactivities.push(data);
        this.newInactivity = { startDate: '', endDate: '' };
      },
      error: (e) => {
        console.log('Error adding inactivity:', e);
        this.openErrorModal('Failed to add inactivity period');
      },
    });
  }

  openErrorModal(message: string) {
    this.errorMessage.nativeElement.textContent = message;
    this.userInactivityModal.show();
  }

  closeErrorModal() {
    this.userInactivityModal.hide();
  }

  onStateChange(): void {
    this.lgas = [];
    this.facilities = [];
    if (this.user.state) {
      const selectedState = this.states.find(
        (s) => s.state === this.user.state
      );
      if (selectedState) {
        this.lgas = selectedState.lgasFacilities.lgas.map(
          (lgaFacilities) => lgaFacilities.lga
        );
      }
    }
  }

  onLgaChange(): void {
    this.facilities = [];
    if (this.user.state && this.user.lga) {
      const selectedState = this.states.find(
        (s) => s.state === this.user.state
      );
      if (selectedState) {
        const selectedLga = selectedState.lgasFacilities.lgas.find(
          (lga) => lga.lga === this.user.lga
        );
        if (selectedLga) {
          this.facilities = selectedLga.facilities;
        }
      }
    }
  }

  updateUser() {
    if (this.validateForm()) {
      this.userService.updateUser(this.id, this.user).subscribe({
        next: (data) => {
          this.redirectToUserList();
        },
        error: (e) => {
          console.log(e);
          this.openErrorModal('Failed to update user');
        },
      });
    }
  }

  redirectToUserList() {
    this.router.navigate(['/users'], {
      queryParams: { sortBy: 'lastModifiedDate' },
    });
  }

  onSubmit() {
    this.updateUser();
  }

  validateForm(): boolean {
    if (!this.user.firstName) {
      this.openErrorModal('First name is required');
      return false;
    }
    if (!this.user.lastName) {
      this.openErrorModal('Last name is required');
      return false;
    }
    if (!this.user.state) {
      this.openErrorModal('State is required');
      return false;
    }
    if (!this.user.lga) {
      this.openErrorModal('LGA is required');
      return false;
    }
    if (!this.user.facility) {
      this.openErrorModal('Facility is required');
      return false;
    }
    return true;
  }

  deleteInactivity(id: string) {
    this.userInactivityService.deleteInactivity(id).subscribe({
      next: () => {
        this.fetchInactivities();
      },
      error: (e) => {
        console.log(e);
        this.openErrorModal('Failed to delete inactivity period');
      },
    });
  }
}
