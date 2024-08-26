import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/User/user.model';
import { FileUploadService } from '../services/file-upload.service';
import { StatesLgasFacilitiesService } from '../services/states-lgas-facilities.service';
import {
  State,
  LgaFacilitiesSet,
} from '../services/states-lgas-facilities.service';
declare var bootstrap: any;

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css'],
})
export class UserCreateComponent implements OnInit, AfterViewInit {
  user: User = new User();
  selectedFiles?: FileList;
  forceSaveModal: any;

  states: State[] = [];
  lgas: string[] = [];
  facilities: string[] = [];

  @ViewChild('warningModal') warningModal!: ElementRef;
  @ViewChild('errorModal') errorModal!: ElementRef;
  @ViewChild('errorMessage') errorMessage!: ElementRef;

  constructor(
    private userService: UserService,
    private router: Router,
    private uploadService: FileUploadService,
    private statesLgasFacilitiesService: StatesLgasFacilitiesService
  ) {}

  ngOnInit(): void {
    this.setupFileInputListener();
    this.fetchStates();
  }

  ngAfterViewInit(): void {
    // Initialize Bootstrap modal
    this.forceSaveModal = new bootstrap.Modal(this.warningModal.nativeElement);
  }

  fetchStates(): void {
    this.statesLgasFacilitiesService.getStatesLgasFacilities().subscribe({
      next: (response) => {
        this.states = response;
      },
      error: (error) => {
        console.log('Error fetching states, LGAs, and facilities:', error);
        this.openErrorModal('Failed to load states, LGAs, and facilities');
      },
    });
  }

  onStateChange(): void {
    this.user.lga = '';
    this.user.facility = '';
    this.lgas = [];
    this.facilities = [];

    if (this.user.state) {
      const selectedState = this.states.find(
        (s) => s.state === this.user.state
      );
      if (selectedState) {
        this.lgas = selectedState.lgasFacilities.lgas.map((lga) => lga.lga);
      }
    }
  }

  onLgaChange(): void {
    this.user.facility = '';
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

  saveUser(forceSave: boolean = false) {
    this.userService.createUser(this.user, forceSave).subscribe({
      next: (response) => {
        if (response.suspectedDuplicate && !forceSave) {
          this.openWarningModal();
        } else {
          this.redirectToUserList();
        }
      },
      error: (e) => {
        this.openErrorModal(e.message);
      },
    });
  }

  proceedAfterWarning() {
    this.forceSaveModal.hide();
    this.saveUser(true);
  }

  openWarningModal() {
    this.forceSaveModal.show();
  }

  openErrorModal(message: string) {
    this.errorMessage.nativeElement.textContent = message;
    const modal = new bootstrap.Modal(this.errorModal.nativeElement);
    modal.show();
  }

  redirectToUserList() {
    this.router.navigate(['/users']);
  }

  onSubmit() {
    if (this.validateForm()) {
      this.saveUser();
    }
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

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  upload(): void {
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('File content: ' + reader.result);
        };
        reader.readAsText(file);

        this.uploadService.upload(file).subscribe({
          next: () => {
            this.redirectToUserList();
          },
          error: (err: any) => {
            console.log('Upload error:', err);
          },
        });
      }

      this.selectedFiles = undefined;
    }
  }

  setupFileInputListener(): void {
    const fileInput = document.getElementById(
      'csvFileInput'
    ) as HTMLInputElement;
    const fileChosen = document.getElementById(
      'file-chosen'
    ) as HTMLInputElement;

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        fileChosen.value = fileInput.files[0].name;
      } else {
        fileChosen.value = 'No file chosen';
      }
    });
  }
}
