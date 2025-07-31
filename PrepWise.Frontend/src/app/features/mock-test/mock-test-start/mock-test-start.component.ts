import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MockTestService } from '../../../core/services/mock-test.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
    selector: 'app-mock-test-start',
    templateUrl: './mock-test-start.component.html',
    styleUrls: ['./mock-test-start.component.css']
})
export class MockTestStartComponent implements OnInit {
    mockTestForm: FormGroup;
    isLoading = false;
    testConfigurations = [
        {
            id: 'standard',
            title: 'Standard Mock Test',
            description: '100 questions, 2 hours duration',
            questionCount: 100,
            timeLimit: 120,
            color: 'primary'
        },
        {
            id: 'quick',
            title: 'Quick Practice Test',
            description: '25 questions, 30 minutes duration',
            questionCount: 25,
            timeLimit: 30,
            color: 'success'
        },
        {
            id: 'comprehensive',
            title: 'Comprehensive Test',
            description: '150 questions, 3 hours duration',
            questionCount: 150,
            timeLimit: 180,
            color: 'warning'
        }
    ];

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private mockTestService: MockTestService,
        private toastr: ToastrService,
        public languageService: LanguageService
    ) {
        this.mockTestForm = this.formBuilder.group({
            testType: ['standard', Validators.required],
            customTitle: [''],
            customQuestionCount: [100, [Validators.min(10), Validators.max(200)]],
            customTimeLimit: [120, [Validators.min(15), Validators.max(300)]]
        });
    }

    ngOnInit(): void {
        this.mockTestForm.get('testType')?.valueChanges.subscribe(value => {
            if (value !== 'custom') {
                const config = this.testConfigurations.find(c => c.id === value);
                if (config) {
                    this.mockTestForm.patchValue({
                        customQuestionCount: config.questionCount,
                        customTimeLimit: config.timeLimit
                    });
                }
            }
        });
    }

    getSelectedConfig() {
        const testType = this.mockTestForm.get('testType')?.value;
        return this.testConfigurations.find(c => c.id === testType);
    }

    async startMockTest() {
        if (this.mockTestForm.invalid) {
            this.toastr.error('Please fill in all required fields correctly.');
            return;
        }

        this.isLoading = true;
        const formValue = this.mockTestForm.value;

        try {
            const title = formValue.customTitle ||
                `${this.getSelectedConfig()?.title || 'Custom Test'} - ${new Date().toLocaleDateString()}`;

            const result = await this.mockTestService.startMockTest({
                title: title,
                questionCount: formValue.customQuestionCount,
                timeLimitMinutes: formValue.customTimeLimit
            }).toPromise();

            if (result?.success) {
                this.toastr.success('Mock test started successfully!');
                this.router.navigate(['/mock-test/play'], {
                    state: { mockTestData: result.mockTestAttempt }
                });
            } else {
                this.toastr.error(result?.message || 'Failed to start mock test');
            }
        } catch (error) {
            console.error('Error starting mock test:', error);
            this.toastr.error('An error occurred while starting the mock test');
        } finally {
            this.isLoading = false;
        }
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
} 