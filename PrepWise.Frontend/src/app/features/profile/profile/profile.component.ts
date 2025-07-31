import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../../core/services/profile.service';
import { LanguageService } from '../../../core/services/language.service';
import { User, UserProfile } from '../../../core/models/profile.model';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    passwordForm: FormGroup;
    user: User | null = null;
    isLoading = false;
    isEditing = false;
    isChangingPassword = false;
    isUpdating = false;
    selectedTab = 'profile';
    achievements: any[] = [];
    testHistory: any[] = [];

    tabs = [
        { id: 'profile', label: 'Profile', icon: 'bi-person' },
        { id: 'settings', label: 'Settings', icon: 'bi-gear' },
        { id: 'achievements', label: 'Achievements', icon: 'bi-trophy' },
        { id: 'history', label: 'Test History', icon: 'bi-clock-history' }
    ];

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private profileService: ProfileService,
        private toastr: ToastrService,
        public languageService: LanguageService
    ) {
        this.profileForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
            location: [''],
            bio: ['']
        });

        this.passwordForm = this.formBuilder.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        this.loadUserProfile();
    }

    async loadUserProfile(): Promise<void> {
        this.isLoading = true;
        try {
            const userId = this.route.snapshot.queryParams['userId'];
            if (userId) {
                this.user = await this.profileService.getUserProfile(userId).toPromise();
            } else {
                this.user = await this.profileService.getCurrentUserProfile().toPromise();
            }

            if (this.user) {
                this.profileForm.patchValue({
                    firstName: this.user.firstName,
                    lastName: this.user.lastName,
                    email: this.user.email,
                    phoneNumber: this.user.phone,
                    location: this.user.location,
                    bio: this.user.bio
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.toastr.error('Failed to load profile');
        } finally {
            this.isLoading = false;
        }
    }

    async updateProfile(): Promise<void> {
        if (this.profileForm.invalid) {
            this.toastr.error('Please fill in all required fields correctly.');
            return;
        }

        this.isLoading = true;
        try {
            const result = await this.profileService.updateProfile(this.profileForm.value).toPromise();

            if (result?.success) {
                this.toastr.success('Profile updated successfully!');
                this.isEditing = false;
                this.loadUserProfile(); // Refresh data
            } else {
                this.toastr.error(result?.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.toastr.error('An error occurred while updating profile');
        } finally {
            this.isLoading = false;
        }
    }

    async changePassword(): Promise<void> {
        if (this.passwordForm.invalid) {
            this.toastr.error('Please fill in all password fields correctly.');
            return;
        }

        this.isLoading = true;
        try {
            const result = await this.profileService.changePassword(this.passwordForm.value).toPromise();

            if (result?.success) {
                this.toastr.success('Password changed successfully!');
                this.isChangingPassword = false;
                this.passwordForm.reset();
            } else {
                this.toastr.error(result?.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.toastr.error('An error occurred while changing password');
        } finally {
            this.isLoading = false;
        }
    }

    passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;

        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            return { passwordMismatch: true };
        }

        return null;
    }

    selectTab(tabId: string): void {
        this.selectedTab = tabId;
    }

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    logout(): void {
        // Implementation for logout
        this.router.navigate(['/auth/login']);
    }

    deleteAccount(): void {
        const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (confirmed) {
            // Implementation for account deletion
            console.log('Deleting account...');
        }
    }

    getPerformanceLevel(score: number): string {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Average';
        if (score >= 50) return 'Below Average';
        return 'Needs Improvement';
    }

    getPerformanceColor(score: number): string {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'danger';
    }

    onUpdateProfile(): void {
        this.updateProfile();
    }

    onChangePassword(): void {
        this.changePassword();
    }

    getScoreColor(score: number): string {
        if (score >= 90) return 'success';
        if (score >= 80) return 'info';
        if (score >= 70) return 'warning';
        return 'danger';
    }
} 