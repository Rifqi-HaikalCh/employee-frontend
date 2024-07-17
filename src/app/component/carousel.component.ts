import { Component, OnInit, ViewChild } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { Galleria } from './interface/galleria.interface';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  providers: [PhotoService]
})
export class CarouselComponent implements OnInit {
  @ViewChild('galleria') galleria!: Galleria;

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

  onImagesChange(event: any) {
    this.images = event;
  }

  prev() {
    if (this.galleria) {
      this.galleria.prev(); // Menggunakan definisi lokal Galleria
    }
  }

  next() {
    if (this.galleria) {
      this.galleria.next(); // Menggunakan definisi lokal Galleria
    }
  }
}
