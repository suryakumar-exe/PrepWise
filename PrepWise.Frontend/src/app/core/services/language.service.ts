import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'en' | 'ta';

export interface LanguageConfig {
    code: Language;
    name: string;
    nativeName: string;
    flag: string;
    rtl: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private currentLanguageSubject = new BehaviorSubject<Language>('en');
    public currentLanguage$ = this.currentLanguageSubject.asObservable();

    private readonly STORAGE_KEY = 'preferred_language';

    // Available languages
    public readonly languages: LanguageConfig[] = [
        {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            flag: '🇺🇸',
            rtl: false
        },
        {
            code: 'ta',
            name: 'Tamil',
            nativeName: 'தமிழ்',
            flag: '🇮🇳',
            rtl: false
        }
    ];

    // Basic translations for UI elements
    private translations: Record<Language, Record<string, string>> = {
        en: {
            // Navigation
            'nav.dashboard': 'Dashboard',
            'nav.quiz': 'Quiz',
            'nav.mockTest': 'Mock Test',
            'nav.leaderboard': 'Leaderboard',
            'nav.chat': 'AI Chat',
            'nav.analytics': 'Analytics',
            'nav.profile': 'Profile',
            'nav.logout': 'Logout',

            // Common
            'common.loading': 'Loading...',
            'common.submit': 'Submit',
            'common.cancel': 'Cancel',
            'common.save': 'Save',
            'common.delete': 'Delete',
            'common.edit': 'Edit',
            'common.view': 'View',
            'common.close': 'Close',
            'common.back': 'Back',
            'common.next': 'Next',
            'common.previous': 'Previous',
            'common.search': 'Search',
            'common.filter': 'Filter',
            'common.sort': 'Sort',
            'common.score': 'Score',
            'common.time': 'Time',
            'common.questions': 'Questions',
            'common.answers': 'Answers',
            'common.correct': 'Correct',
            'common.incorrect': 'Incorrect',
            'common.unanswered': 'Unanswered',

            // Authentication
            'auth.login': 'Login',
            'auth.register': 'Register',
            'auth.email': 'Email',
            'auth.password': 'Password',
            'auth.firstName': 'First Name',
            'auth.lastName': 'Last Name',
            'auth.phoneNumber': 'Phone Number',
            'auth.confirmPassword': 'Confirm Password',
            'auth.forgotPassword': 'Forgot Password?',
            'auth.rememberMe': 'Remember Me',
            'auth.loginSuccess': 'Login successful!',
            'auth.registerSuccess': 'Registration successful!',

            // Quiz
            'quiz.selectSubject': 'Select Subject',
            'quiz.difficulty': 'Difficulty',
            'quiz.language': 'Language',
            'quiz.timeLimit': 'Time Limit',
            'quiz.questionCount': 'Number of Questions',
            'quiz.startQuiz': 'Start Quiz',
            'quiz.submitQuiz': 'Submit Quiz',
            'quiz.timeRemaining': 'Time Remaining',
            'quiz.questionNumber': 'Question',
            'quiz.of': 'of',
            'quiz.nextQuestion': 'Next Question',
            'quiz.previousQuestion': 'Previous Question',
            'quiz.reviewAnswers': 'Review Answers',
            'quiz.submitConfirm': 'Are you sure you want to submit the quiz?',

            // Mock Test
            'mockTest.title': 'Mock Test',
            'mockTest.description': '100 questions from all subjects',
            'mockTest.timeLimit': '2 hours',
            'mockTest.start': 'Start Mock Test',
            'mockTest.progress': 'Progress',
            'mockTest.timeRemaining': 'Time Remaining',
            'mockTest.submitTest': 'Submit Test',

            // Results
            'results.congratulations': 'Congratulations!',
            'results.yourScore': 'Your Score',
            'results.correctAnswers': 'Correct Answers',
            'results.wrongAnswers': 'Wrong Answers',
            'results.unansweredQuestions': 'Unanswered Questions',
            'results.timeTaken': 'Time Taken',
            'results.percentage': 'Percentage',
            'results.grade': 'Grade',
            'results.viewDetails': 'View Details',
            'results.retakeQuiz': 'Retake Quiz',

            // Leaderboard
            'leaderboard.title': 'Leaderboard',
            'leaderboard.rank': 'Rank',
            'leaderboard.name': 'Name',
            'leaderboard.score': 'Score',
            'leaderboard.attempts': 'Attempts',
            'leaderboard.global': 'Global Ranking',
            'leaderboard.subject': 'Subject Wise',

            // Chat
            'chat.title': 'AI Assistant',
            'chat.placeholder': 'Ask me about exam preparation...',
            'chat.send': 'Send',
            'chat.typing': 'AI is typing...',
            'chat.suggestedQuestions': 'Suggested Questions',

            // Subjects
            'subjects.tamilSubject': 'Tamil Subject',
            'subjects.tamilGrammar': 'Tamil Grammar',
            'subjects.simplification': 'Simplification',
            'subjects.percentage': 'Percentage',
            'subjects.hcfLcm': 'HCF and LCM',
            'subjects.ratioProportionTitle': 'Ratio and Proportion',
            'subjects.areaVolume': 'Area and Volume',
            'subjects.generalScience': 'General Science',
            'subjects.currentEvents': 'Current Events',
            'subjects.geography': 'Geography',
            'subjects.historyCulture': 'History and Culture',
            'subjects.indianPolity': 'Indian Polity'
        },
        ta: {
            // Navigation
            'nav.dashboard': 'முகப்பு',
            'nav.quiz': 'வினாடி வினா',
            'nav.mockTest': 'மாதிரி தேர்வு',
            'nav.leaderboard': 'தலைமை பலகை',
            'nav.chat': 'AI உரையாடல்',
            'nav.analytics': 'பகுப்பாய்வு',
            'nav.profile': 'சுயவிவரம்',
            'nav.logout': 'வெளியேறு',

            // Common
            'common.loading': 'ஏற்றுகிறது...',
            'common.submit': 'சமர்ப்பிக்கவும்',
            'common.cancel': 'ரத்து செய்யவும்',
            'common.save': 'சேமிக்கவும்',
            'common.delete': 'நீக்கவும்',
            'common.edit': 'திருத்தவும்',
            'common.view': 'காண்க',
            'common.close': 'மூடு',
            'common.back': 'பின்',
            'common.next': 'அடுத்து',
            'common.previous': 'முந்தைய',
            'common.search': 'தேடு',
            'common.filter': 'வடிகட்டி',
            'common.sort': 'வரிசைப்படுத்து',
            'common.score': 'மதிப்பெண்',
            'common.time': 'நேரம்',
            'common.questions': 'கேள்விகள்',
            'common.answers': 'பதில்கள்',
            'common.correct': 'சரியான',
            'common.incorrect': 'தவறான',
            'common.unanswered': 'பதிலளிக்காத',

            // Authentication
            'auth.login': 'உள்நுழைய',
            'auth.register': 'பதிவு செய்ய',
            'auth.email': 'மின்னஞ்சல்',
            'auth.password': 'கடவுச்சொல்',
            'auth.firstName': 'முதல் பெயர்',
            'auth.lastName': 'கடைசி பெயர்',
            'auth.phoneNumber': 'தொலைபேசி எண்',
            'auth.confirmPassword': 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
            'auth.forgotPassword': 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
            'auth.rememberMe': 'என்னை நினைவில் வைத்துக்கொள்ளுங்கள்',
            'auth.loginSuccess': 'உள்நுழைவு வெற்றிகரமாக!',
            'auth.registerSuccess': 'பதிவு வெற்றிகரமாக!',

            // Quiz
            'quiz.selectSubject': 'பாடத்தை தேர்ந்தெடுக்கவும்',
            'quiz.difficulty': 'சிரமம்',
            'quiz.language': 'மொழி',
            'quiz.timeLimit': 'நேர வரம்பு',
            'quiz.questionCount': 'கேள்விகளின் எண்ணிக்கை',
            'quiz.startQuiz': 'வினாடி வினாவை தொடங்கு',
            'quiz.submitQuiz': 'வினாடி வினாவை சமர்ப்பிக்கவும்',
            'quiz.timeRemaining': 'மீதமுள்ள நேரம்',
            'quiz.questionNumber': 'கேள்வி',
            'quiz.of': 'இல்',
            'quiz.nextQuestion': 'அடுத்த கேள்வி',
            'quiz.previousQuestion': 'முந்தைய கேள்வி',
            'quiz.reviewAnswers': 'பதில்களை மதிப்பிடவும்',
            'quiz.submitConfirm': 'நீங்கள் நிச்சயமாக வினாடி வினாவை சமர்ப்பிக்க விரும்புகிறீர்களா?',

            // Mock Test
            'mockTest.title': 'மாதிரி தேர்வு',
            'mockTest.description': 'அனைத்து பாடங்களிலிருந்தும் 100 கேள்விகள்',
            'mockTest.timeLimit': '2 மணி நேரம்',
            'mockTest.start': 'மாதிரி தேர்வை தொடங்கு',
            'mockTest.progress': 'முன்னேற்றம்',
            'mockTest.timeRemaining': 'மீதமுள்ள நேரம்',
            'mockTest.submitTest': 'தேர்வை சமர்ப்பிக்கவும்',

            // Results
            'results.congratulations': 'வாழ்த்துக்கள்!',
            'results.yourScore': 'உங்கள் மதிப்பெண்',
            'results.correctAnswers': 'சரியான பதில்கள்',
            'results.wrongAnswers': 'தவறான பதில்கள்',
            'results.unansweredQuestions': 'பதிலளிக்காத கேள்விகள்',
            'results.timeTaken': 'எடுத்த நேரம்',
            'results.percentage': 'சதவீதம்',
            'results.grade': 'தரம்',
            'results.viewDetails': 'விவரங்களை காண்க',
            'results.retakeQuiz': 'மீண்டும் வினாடி வினா',

            // Leaderboard
            'leaderboard.title': 'தலைமை பலகை',
            'leaderboard.rank': 'தரவரிசை',
            'leaderboard.name': 'பெயர்',
            'leaderboard.score': 'மதிப்பெண்',
            'leaderboard.attempts': 'முயற்சிகள்',
            'leaderboard.global': 'உலகளாவிய தரவரிசை',
            'leaderboard.subject': 'பாடம் வாரியாக',

            // Chat
            'chat.title': 'AI உதவியாளர்',
            'chat.placeholder': 'தேர்வு தயாரிப்பைப் பற்றி என்னிடம் கேளுங்கள்...',
            'chat.send': 'அனுப்பு',
            'chat.typing': 'AI தட்டச்சு செய்கிறது...',
            'chat.suggestedQuestions': 'பரிந்துரைக்கப்பட்ட கேள்விகள்',

            // Subjects
            'subjects.tamilSubject': 'தமிழ் பாடம்',
            'subjects.tamilGrammar': 'தமிழ் இலக்கணம்',
            'subjects.simplification': 'எளிமைப்படுத்தல்',
            'subjects.percentage': 'சதவீதம்',
            'subjects.hcfLcm': 'மகா.சாம. மற்றும் கணி.மகா.',
            'subjects.ratioProportionTitle': 'விகிதம் மற்றும் விகிதாச்சாரம்',
            'subjects.areaVolume': 'பரப்பளவு மற்றும் கன அளவு',
            'subjects.generalScience': 'பொது அறிவியல்',
            'subjects.currentEvents': 'நடப்பு நிகழ்வுகள்',
            'subjects.geography': 'புவியியல்',
            'subjects.historyCulture': 'வரலாறு மற்றும் பண்பாடு',
            'subjects.indianPolity': 'இந்திய அரசியல்'
        }
    };

    constructor() {
        this.initializeLanguage();
    }

    private initializeLanguage(): void {
        const savedLanguage = localStorage.getItem(this.STORAGE_KEY) as Language;
        if (savedLanguage && this.isValidLanguage(savedLanguage)) {
            this.currentLanguageSubject.next(savedLanguage);
        } else {
            // Default to English if no saved preference or invalid language
            this.setLanguage('en');
        }
    }

    setLanguage(language: Language): void {
        if (this.isValidLanguage(language)) {
            this.currentLanguageSubject.next(language);
            localStorage.setItem(this.STORAGE_KEY, language);

            // Update document language attribute
            document.documentElement.lang = language;

            // Set direction for RTL languages (if needed in future)
            const config = this.getLanguageConfig(language);
            document.documentElement.dir = config?.rtl ? 'rtl' : 'ltr';
        }
    }

    getCurrentLanguage(): Language {
        return this.currentLanguageSubject.value;
    }

    getLanguageConfig(language: Language): LanguageConfig | undefined {
        return this.languages.find(lang => lang.code === language);
    }

    translate(key: string, language?: Language): string {
        const lang = language || this.getCurrentLanguage();
        return this.translations[lang]?.[key] || key;
    }

    // Get all translations for current language
    getTranslations(language?: Language): Record<string, string> {
        const lang = language || this.getCurrentLanguage();
        return this.translations[lang] || {};
    }

    private isValidLanguage(language: string): language is Language {
        return this.languages.some(lang => lang.code === language);
    }

    // Helper method to get translated subject names
    getSubjectTranslations(): Record<string, string> {
        const currentLang = this.getCurrentLanguage();
        return {
            'Tamil Subject Quiz': this.translate('subjects.tamilSubject', currentLang),
            'Tamil Grammar': this.translate('subjects.tamilGrammar', currentLang),
            'Simplification': this.translate('subjects.simplification', currentLang),
            'Percentage': this.translate('subjects.percentage', currentLang),
            'HCF and LCM': this.translate('subjects.hcfLcm', currentLang),
            'Ratio and Proportion': this.translate('subjects.ratioProportionTitle', currentLang),
            'Area and Volume': this.translate('subjects.areaVolume', currentLang),
            'General Science': this.translate('subjects.generalScience', currentLang),
            'Current Events': this.translate('subjects.currentEvents', currentLang),
            'Geography': this.translate('subjects.geography', currentLang),
            'History and Culture': this.translate('subjects.historyCulture', currentLang),
            'Indian Polity': this.translate('subjects.indianPolity', currentLang)
        };
    }
} 