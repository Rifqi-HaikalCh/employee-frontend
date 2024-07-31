import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, AfterViewInit {
  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  images: any[] = [
    { itemImageSrc: '/images/carousel/slide5.jpeg', alt: 'Description for Image 1', title: 'Title 1' },
    { itemImageSrc: '/images/carousel/slide2.png', alt: 'Description for Image 2', title: 'Title 2' },
    { itemImageSrc: '/images/carousel/slide6.jpeg', alt: 'Description for Image 3', title: 'Title 3' }
  ];

  currentIndex: number = 0;

  constructor() {}

  ngOnInit() {
    // Images are directly set in the component now
  }

  ngAfterViewInit() {
    this.startAutoplay();
  }

  prev() {
    this.currentIndex = (this.currentIndex > 0) ? this.currentIndex - 1 : this.images.length - 1;
    this.updateCarousel();
  }

  next() {
    this.currentIndex = (this.currentIndex < this.images.length - 1) ? this.currentIndex + 1 : 0;
    this.updateCarousel();
  }

  startAutoplay() {
    setInterval(() => {
      this.next();
    }, 3000); // Change to 3000 milliseconds for 3 seconds
  }

  updateCarousel() {
    const offset = -this.currentIndex * 100;
    (this.carousel.nativeElement.querySelector('.carousel-items') as HTMLElement).style.transform = `translateX(${offset}%)`;
  }
}
