# PrepWise Frontend - TNPSC AI-Powered Quiz Platform

A modern Angular frontend for the TNPSC exam preparation platform with AI-powered questions, multi-language support, and comprehensive analytics.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based authentication with secure login/register
- **Multi-language Support**: Questions and UI in English and Tamil
- **AI-Powered Questions**: Dynamic question generation using OpenAI integration
- **Skill Score Tracking**: Adaptive difficulty based on performance
- **Quiz System**: Practice quizzes with timers and instant feedback
- **Mock Tests**: 100-question mixed-subject tests (2-hour duration)
- **AI Chatbot**: Interactive assistance for exam preparation
- **Global Leaderboard**: Performance rankings and competition
- **Analytics Dashboard**: Performance insights and trending topics

### Quiz Subjects
1. **Tamil Subject Quiz** (Standard 6th to 10th)
2. **Tamil Grammar** (Grammar, Literature, Comprehension, Vocabulary)
3. **Simplification** (Mathematical)
4. **Percentage** (Calculations)
5. **HCF and LCM** (Highest Common Factor and Least Common Multiple)
6. **Ratio and Proportion**
7. **Area and Volume** (Calculations)
8. **General Science** (Physics, Chemistry, Biology)
9. **Current Events** (Current Affairs)
10. **Geography** (Indian and World)
11. **History and Culture** (Indian)
12. **Indian Polity** (Constitution and Politics)

## 🛠️ Technology Stack

- **Framework**: Angular 17
- **Styling**: Bootstrap 5 + Custom CSS with CSS Variables
- **State Management**: RxJS + Services
- **HTTP Client**: Apollo GraphQL Client
- **Notifications**: ngx-toastr
- **Loading Indicators**: ngx-spinner
- **Charts**: Chart.js + ng2-charts
- **Icons**: Bootstrap Icons
- **Authentication**: JWT Tokens

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **Angular CLI** (v17.x)

```bash
# Install Angular CLI globally
npm install -g @angular/cli@17
```

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
# Navigate to the frontend directory
cd PrepWise.Frontend

# Install all dependencies
npm install
```

### 2. Environment Configuration

Create environment files for different configurations:

```bash
# Create environment files
mkdir src/environments
```

**src/environments/environment.ts** (Development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',
  graphqlUrl: 'http://localhost:5000/graphql',
  appName: 'PrepWise',
  version: '1.0.0'
};
```

**src/environments/environment.prod.ts** (Production):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com',
  graphqlUrl: 'https://your-production-api.com/graphql',
  appName: 'PrepWise',
  version: '1.0.0'
};
```

### 3. Assets Setup

Create the assets directory structure:

```bash
mkdir -p src/assets/images
mkdir -p src/assets/icons
```

Add your logo and other assets to the `src/assets/images/` directory.

## 🚀 Running the Application

### Development Server

```bash
# Start the development server
npm start

# Or using Angular CLI
ng serve
```

The application will be available at `http://localhost:4200`

### Production Build

```bash
# Build for production
npm run build

# Or using Angular CLI
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## 🏗️ Project Structure

```
PrepWise.Frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services, guards, interceptors
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── models/
│   │   │   └── services/
│   │   ├── shared/                  # Shared components, directives, pipes
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   ├── features/                # Feature modules (lazy loaded)
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── quiz/
│   │   │   ├── mock-test/
│   │   │   ├── leaderboard/
│   │   │   ├── chat/
│   │   │   ├── analytics/
│   │   │   └── profile/
│   │   ├── app-routing.module.ts
│   │   ├── app.component.*
│   │   └── app.module.ts
│   ├── assets/
│   ├── environments/
│   ├── styles.css                   # Global styles
│   └── index.html
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Authentication Flow

1. **Login/Register**: User authentication with email/password
2. **JWT Storage**: Secure token storage in localStorage
3. **Route Protection**: Auth guards prevent unauthorized access
4. **Auto-logout**: Automatic logout on token expiration
5. **Interceptors**: Automatic token attachment to API requests

## 🌐 API Integration

The frontend integrates with the backend GraphQL API for:

### Authentication Mutations
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    success
    message
    token
    user { id email firstName lastName }
  }
}
```

### Quiz Operations
```graphql
mutation StartQuizAttempt($userId: Int!, $subjectId: Int!) {
  startQuizAttempt(userId: $userId, subjectId: $subjectId) {
    success
    quizAttempt { id startedAt }
    questions { id text options { id text } }
  }
}
```

## 🎨 Styling & Theming

### CSS Custom Properties
The application uses CSS custom properties for consistent theming:

```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  /* ... more variables */
}
```

### Dark Mode Support
Automatic dark mode detection with `prefers-color-scheme` media query.

### Responsive Design
Mobile-first responsive design with Bootstrap breakpoints.

## 🌍 Multi-language Support

### Language Service
```typescript
// Switch language
this.languageService.setLanguage('ta'); // Tamil
this.languageService.setLanguage('en'); // English

// Translate text
this.languageService.translate('nav.dashboard');
```

### Supported Languages
- **English** (en) - Default
- **Tamil** (ta) - தமிழ்

## 📱 Progressive Web App (PWA)

To add PWA support:

```bash
ng add @angular/pwa
```

This adds:
- Service worker for offline functionality
- App manifest for installation
- Icon sets for different platforms

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test -- --code-coverage
```

### End-to-End Tests
```bash
# Install Cypress
npm install cypress --save-dev

# Run e2e tests
npm run e2e
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/prepwise-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Netlify/Vercel Deployment
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist/prepwise-frontend`
4. Deploy!

## 🔧 Configuration

### Backend URL
Update the GraphQL endpoint in `app.module.ts`:

```typescript
export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  return {
    link: httpLink.create({
      uri: 'http://localhost:5000/graphql', // Update this URL
    }),
    cache: new InMemoryCache(),
  };
}
```

### Feature Flags
Control feature availability through environment variables or service configuration.

## 📊 Performance Optimization

### Implemented Optimizations
- **Lazy Loading**: Feature modules loaded on demand
- **OnPush Change Detection**: Optimized component updates
- **TrackBy Functions**: Efficient list rendering
- **Image Optimization**: WebP format with fallbacks
- **Bundle Splitting**: Vendor and app bundles separated

### Bundle Analysis
```bash
npm install webpack-bundle-analyzer --save-dev
ng build --stats-json
npx webpack-bundle-analyzer dist/prepwise-frontend/stats.json
```

## 🐛 Troubleshooting

### Common Issues

1. **Node Modules**: Clear node_modules and reinstall
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Angular CLI**: Update to latest version
   ```bash
   npm uninstall -g @angular/cli
   npm install -g @angular/cli@latest
   ```

3. **CORS Issues**: Ensure backend CORS is configured for frontend URL

4. **Memory Issues**: Increase Node memory
   ```bash
   export NODE_OPTIONS="--max-old-space-size=8192"
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use Angular style guide
- Follow TypeScript best practices
- Maintain consistent formatting with Prettier

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Angular team for the excellent framework
- Bootstrap team for the UI components
- Apollo GraphQL for state management
- Open source community for various libraries

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Happy Coding! 🚀** 