import { Pipe, PipeTransform, inject } from '@angular/core';
import {
    DomSanitizer, SafeHtml, SafeStyle,
    SafeScript, SafeUrl, SafeResourceUrl
} from '@angular/platform-browser';

@Pipe({
    name: 'safeHtml'
})
export class SafeHTMLPipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);
    transform(value: string | null): SafeHtml {
        return value ? this.sanitizer.bypassSecurityTrustHtml(value) : '';
    }
}

@Pipe({
    name: 'safeStyle',
})
export class SafeStylePipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);
    transform(value: string): SafeStyle {
        return this.sanitizer.bypassSecurityTrustStyle(value);
    }
}

@Pipe({
    name: 'safeScript',
})
export class SafeScriptPipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);
    transform(value: string): SafeScript {
        return this.sanitizer.bypassSecurityTrustScript(value);
    }
}

@Pipe({
    name: 'safeUrl',
})
export class SafeUrlPipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);
    transform(value: string): SafeUrl {
        return this.sanitizer.bypassSecurityTrustUrl(value);
    }
}

@Pipe({
    name: 'safeResourceUrl',
})
export class SafeResourceUrlPipe implements PipeTransform {

    private sanitizer = inject(DomSanitizer);

    transform(value: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }
}