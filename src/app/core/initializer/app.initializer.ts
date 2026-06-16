import { Router } from '@angular/router';
import { BootService } from '../service/boot.service';

export function initializeAppFactory(
    bootService: BootService,
    router: Router
): () => any {
    return () => bootService.load();
}
