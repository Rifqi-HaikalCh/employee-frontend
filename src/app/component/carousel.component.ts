import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  providers: [PhotoService]
})
export class CarouselComponent implements OnInit, AfterViewInit {
  @ViewChild('galleria', { static: false }) galleria!: ElementRef;

  images: any[] = [];

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  constructor(private photoService: PhotoService) {}

  ngOnInit() {
    this.photoService.getImages().then(images => {
      this.images = images;
    });
  }

  ngAfterViewInit() {
    this.startAutoplay();
  }

  onImagesChange(event: any) {
    this.images = event;
  }

  prev() {
    if (this.galleria && this.galleria.nativeElement) {
      const element = this.galleria.nativeElement.querySelector('.p-galleria-prev');
      if (element) {
        element.click();
      }
    }
  }

  next() {
    if (this.galleria && this.galleria.nativeElement) {
      const element = this.galleria.nativeElement.querySelector('.p-galleria-next');
      if (element) {
        element.click();
      }
    }
  }

  startAutoplay() {
    setInterval(() => {
      this.next();
    }, 3000); // Change to 3000 milliseconds for 3 seconds
  }
}
