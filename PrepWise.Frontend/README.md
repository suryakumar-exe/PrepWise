# PrepWise Frontend - TNPSC Group 4 Exam Preparation

A modern Angular application for TNPSC Group 4 exam preparation with interactive quizzes, mock tests, AI-powered chat assistance, and comprehensive analytics.

## Features

### Core Features
- **User Authentication**: Secure login and registration with JWT tokens
- **Multi-language Support**: English and Tamil interface support
- **Interactive Quizzes**: Practice quizzes with real-time scoring and analytics
- **Mock Tests**: 100-question comprehensive tests with configurable time limits
- **AI Chat Assistant**: Interactive chatbot for exam preparation guidance
- **Performance Analytics**: Detailed performance tracking and insights
- **Global Leaderboard**: Real-time rankings with rounded score display
- **Responsive Design**: Mobile-first design with modern UI/UX
- **Loading States**: Professional loading spinners and overlays

### Quiz System
- **Subject-based Quizzes**: 12 different subjects with varying difficulty levels
- **Real-time Timer**: Countdown timer with warning states
- **Question Navigation**: Easy navigation between questions
- **Auto-save**: Automatic saving of answers during quiz
- **Detailed Results**: Comprehensive result analysis with performance metrics

### Mock Test System
- **Configurable Time Limits**: Custom time limits (default: 120 minutes)
- **100 Mixed Questions**: Questions from all subjects
- **Professional UI**: Enhanced question display with better styling
- **Session Storage**: Reliable data persistence between components
- **Loading Overlays**: Professional submission process with spinners

### Chat System
- **AI-Powered Responses**: Intelligent responses for exam preparation
- **Message History**: Persistent chat history with user context
- **Real-time Interface**: Modern chat interface with typing indicators
- **Error Handling**: Graceful error handling with user-friendly messages

### Analytics & Leaderboard
- **Performance Tracking**: Detailed skill score tracking per subject
- **Visual Analytics**: Charts and graphs for performance insights
- **Global Rankings**: Real-time leaderboard with rounded scores
- **Personal Statistics**: Individual performance metrics and trends

## Technology Stack

- **Angular 17**: Core framework with latest features
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming for state management
- **Angular Material**: UI components and theming
- **GraphQL**: Apollo Client for API communication
- **Bootstrap 5**: Responsive CSS framework
- **Chart.js**: Data visualization
- **Toastr**: User notifications
- **NgRx**: State management (optional)

## Project Structure

```
PrepWise.Frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Core services and guards
│   │   │   ├── guards/             # Route guards
│   │   │   ├── interceptors/       # HTTP interceptors
│   │   │   ├── models/             # Data models and interfaces
│   │   │   └── services/           # Core services
│   │   ├── features/               # Feature modules
│   │   │   ├── analytics/          # Analytics and reporting
│   │   │   ├── auth/               # Authentication
│   │   │   ├── chat/               # AI chat system
│   │   │   ├── dashboard/          # Main dashboard
│   │   │   ├── leaderboard/        # Global leaderboard
│   │   │   ├── mock-test/          # Mock test system
│   │   │   ├── profile/            # User profile
│   │   │   └── quiz/               # Quiz system
│   │   ├── shared/                 # Shared components
│   │   │   ├── components/         # Reusable components
│   │   │   ├── directives/         # Custom directives
│   │   │   └── pipes/              # Custom pipes
│   │   └── app.module.ts           # Root module
│   ├── environments/               # Environment configurations
│   └── styles.css                  # Global styles
├── angular.json                    # Angular CLI configuration
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Angular CLI (`npm install -g @angular/cli`)

### 1. Install Dependencies
```bash
cd PrepWise.Frontend
npm install
```

### 2. Configure Environment
Update `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/graphql',
  appName: 'PrepWise'
};
```

### 3. Run Development Server
```bash
ng serve
```

The application will be available at: **http://localhost:4200**

### 4. Build for Production
```bash
ng build --configuration production
```

## Key Components

### Authentication System
- **Login Component**: Email/password authentication
- **Register Component**: User registration with validation
- **Auth Guard**: Route protection for authenticated users
- **JWT Interceptor**: Automatic token handling

### Quiz System
- **Quiz Start**: Subject selection and configuration
- **Quiz Play**: Interactive question interface with timer
- **Quiz Result**: Detailed performance analysis
- **Question Card**: Reusable question display component

### Mock Test System
- **Mock Test Start**: Configuration and time limit setup
- **Mock Test Play**: Enhanced question interface with navigation
- **Mock Test Result**: Comprehensive result display
- **Session Storage**: Reliable data persistence

### Chat System
- **Chat Interface**: Modern chat UI with message history
- **AI Integration**: GraphQL integration with backend AI services
- **Error Handling**: Graceful error handling and fallbacks
- **Loading States**: Professional loading indicators

### Analytics & Leaderboard
- **Performance Charts**: Visual performance analytics
- **Skill Scores**: Subject-wise performance tracking
- **Global Rankings**: Real-time leaderboard updates
- **Score Rounding**: Automatic percentage rounding

## Recent Improvements

### Enhanced UI/UX
- **Modern Design**: Updated color scheme and typography
- **Responsive Layout**: Mobile-first responsive design
- **Loading States**: Professional spinners and overlays
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success and error notifications

### Mock Test Enhancements
- **Configurable Time Limits**: Custom time limit selection
- **Enhanced Navigation**: Improved question navigation
- **Session Storage**: Reliable data passing between components
- **Professional UI**: Better question styling and layout
- **Loading Overlays**: Submission process with spinners

### Chat System Improvements
- **Multi-AI Provider Support**: Integration with multiple AI providers
- **Enhanced Error Handling**: Detailed error logging and fallbacks
- **Message Persistence**: Reliable message storage
- **Real-time Updates**: Live chat interface updates

### Performance Optimizations
- **Lazy Loading**: Feature-based lazy loading
- **Caching**: Intelligent data caching
- **Bundle Optimization**: Reduced bundle sizes
- **Memory Management**: Improved memory usage

### Leaderboard Enhancements
- **Score Rounding**: Automatic percentage rounding (e.g., 46.835% → 47%)
- **Performance Optimization**: Efficient data loading
- **Visual Improvements**: Better score display and color coding
- **Real-time Updates**: Live leaderboard updates

## Development Guidelines

### Code Style
- Follow Angular style guide
- Use TypeScript strict mode
- Implement proper error handling
- Add comprehensive logging
- Use reactive programming with RxJS

### Component Structure
```typescript
@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.css']
})
export class FeatureComponent implements OnInit, OnDestroy {
  // Properties
  public data: any[] = [];
  public loading = false;
  public error: string | null = null;

  // Constructor with dependency injection
  constructor(
    private service: FeatureService,
    private toastr: ToastrService
  ) {}

  // Lifecycle hooks
  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions
  }

  // Methods
  private loadData(): void {
    this.loading = true;
    this.service.getData().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        this.toastr.error('Failed to load data');
      }
    });
  }
}
```

### Service Pattern
```typescript
@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getData(): Observable<any[]> {
    const query = `
      query GetData {
        data {
          id
          name
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query })
      .pipe(
        map(response => response.data.data),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong'));
  }
}
```

## Testing

### Unit Tests
```bash
# Run unit tests
ng test

# Run tests with coverage
ng test --code-coverage
```

### E2E Tests
```bash
# Run end-to-end tests
ng e2e
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Quiz creation and completion
- [ ] Mock test flow (start → play → result)
- [ ] Chat system functionality
- [ ] Leaderboard display
- [ ] Analytics and reporting
- [ ] Mobile responsiveness
- [ ] Error handling scenarios

## Deployment

### Build Configuration
```bash
# Production build
ng build --configuration production

# Development build
ng build --configuration development
```

### Environment Files
- `environment.ts`: Development settings
- `environment.prod.ts`: Production settings

### Deployment Options
- **Netlify**: Static site hosting
- **Vercel**: Serverless deployment
- **Azure Static Web Apps**: Microsoft cloud hosting
- **AWS S3 + CloudFront**: Scalable static hosting

## Troubleshooting

### Common Issues

**Build Errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Angular cache: `ng cache clean`
- Check TypeScript version compatibility

**Runtime Errors:**
- Check browser console for detailed error messages
- Verify API endpoint configuration
- Ensure backend services are running

**Performance Issues:**
- Enable production mode: `ng serve --configuration production`
- Check bundle analyzer: `ng build --stats-json`
- Optimize images and assets

### Debug Mode
Enable debug logging in `environment.ts`:
```typescript
export const environment = {
  production: false,
  debug: true,
  apiUrl: 'https://localhost:7001/graphql'
};
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes following the coding guidelines
4. Add comprehensive error handling and logging
5. Test thoroughly (unit tests, manual testing)
6. Submit a pull request with detailed description

## Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS Safari, Chrome Mobile

## Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## Security Considerations

- **JWT Token Management**: Secure token storage and refresh
- **Input Validation**: Client-side validation with server-side verification
- **XSS Protection**: Angular's built-in XSS protection
- **CSRF Protection**: GraphQL endpoint protection
- **Content Security Policy**: CSP headers for additional security

## License

This project is licensed under the MIT License. 