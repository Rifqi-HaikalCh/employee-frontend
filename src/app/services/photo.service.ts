import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  getImages() {
    return Promise.resolve([
      { itemImageSrc: 'https://mdbcdn.b-cdn.net/img/new/slides/041.webp', alt: 'Description for Image 1', title: 'Title 1' },
      { itemImageSrc: 'https://mdbcdn.b-cdn.net/img/new/slides/043.webp', alt: 'Description for Image 2', title: 'Title 2' },
      { itemImageSrc: 'https://mdbcdn.b-cdn.net/img/new/slides/042.webp', alt: 'Description for Image 3', title: 'Title 3' }
    ]);
  }
}
