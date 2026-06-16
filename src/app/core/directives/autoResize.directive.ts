// auto-resize-select.directive.ts
import {
  Directive,
  ElementRef,
  Renderer2,
  AfterViewInit,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[autoResizeSelect]',
  standalone: true,
})
export class AutoResizeSelectDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.adjustWidth();
  }

  @HostListener('change')
  @HostListener('ngModelChange')
  adjustWidth() {
    const container = this.el.nativeElement.querySelector(
      '.ng-select-container'
    );
    const selectedText = this.el.nativeElement.querySelector('.ng-value');
    if (container && selectedText) {
      const temp = document.createElement('span');
      temp.style.visibility = 'hidden';
      temp.style.whiteSpace = 'nowrap';
      temp.style.font = getComputedStyle(container).font;
      temp.innerText = selectedText.innerText;
      document.body.appendChild(temp);

      const newWidth = Math.min(temp.offsetWidth + 50, 600); // add padding, cap width
      this.renderer.setStyle(container, 'width', `${newWidth}px`);

      temp.remove();
    }
  }
}
