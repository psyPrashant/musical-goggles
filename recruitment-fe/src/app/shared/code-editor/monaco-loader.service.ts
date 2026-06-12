import { Injectable } from '@angular/core';

declare global {
  interface Window {
    require: any;
    monaco: any;
  }
}

/**
 * Loads the self-hosted Monaco AMD build (served from /monaco via angular.json
 * assets) on first use. Keeping Monaco out of the main bundle means
 * assessments without code questions never pay its download cost.
 */
@Injectable({ providedIn: 'root' })
export class MonacoLoaderService {
  private loadPromise: Promise<any> | null = null;

  load(): Promise<any> {
    if (!this.loadPromise) {
      this.loadPromise = this.loadMonaco();
      this.loadPromise.catch(() => (this.loadPromise = null));
    }
    return this.loadPromise;
  }

  private loadMonaco(): Promise<any> {
    if (window.monaco?.editor) {
      return Promise.resolve(window.monaco);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/monaco/vs/loader.js';
      script.onerror = () => reject(new Error('Failed to load Monaco loader script'));
      script.onload = () => {
        try {
          window.require.config({ paths: { vs: '/monaco/vs' } });
          window.require(
            ['vs/editor/editor.main'],
            () => resolve(window.monaco),
            (err: unknown) => reject(err ?? new Error('Failed to load Monaco editor')),
          );
        } catch (err) {
          reject(err);
        }
      };
      document.body.appendChild(script);
    });
  }
}
