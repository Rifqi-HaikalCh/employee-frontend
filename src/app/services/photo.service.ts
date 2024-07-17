import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  getImages() {
    return Promise.resolve([
      { itemImageSrc: 'images/carousel/slide1.png', alt: 'Description for Image 1', title: 'Title 1' },
      { itemImageSrc: 'images/carousel/slide2.png', alt: 'Description for Image 2', title: 'Title 2' },
      { itemImageSrc: 'images/carousel/slide3.png', alt: 'Description for Image 3', title: 'Title 3' }
    ]);
  }
}
