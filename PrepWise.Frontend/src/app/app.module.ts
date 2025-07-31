import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Apollo GraphQL
import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

// Third-party modules
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';

// App modules
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

// Feature modules (will be lazy loaded)
// Auth components will be in auth module
// Dashboard, Quiz, MockTest, etc. will be in their respective modules

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
    return {
        link: httpLink.create({
            uri: 'http://localhost:5000/graphql', // Update this to match your API endpoint
        }),
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                errorPolicy: 'all',
            },
        },
    };
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        CoreModule,
        SharedModule,
        ToastrModule.forRoot({
            timeOut: 3000,
            positionClass: 'toast-top-right',
            preventDuplicates: true,
            progressBar: true,
            progressAnimation: 'increasing',
            closeButton: true
        }),
        NgxSpinnerModule.forRoot({
            type: 'ball-scale-multiple'
        })
    ],
    providers: [
        {
            provide: APOLLO_OPTIONS,
            useFactory: createApollo,
            deps: [HttpLink],
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { } 