import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';

@Directive({
    selector: '[autoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {
    @Input() autoFocus: boolean = true;

    constructor(private elementRef: ElementRef) { }

    ngAfterViewInit(): void {
        if (this.autoFocus) {
            // Use setTimeout to ensure the element is fully rendered
            setTimeout(() => {
                this.elementRef.nativeElement.focus();
            }, 100);
        }
    }
} 