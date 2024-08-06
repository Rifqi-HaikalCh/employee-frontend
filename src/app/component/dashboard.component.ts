import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  slides = [
    { src: 'images/carousel/slide1.png', title: 'First slide label', description: 'Nulla vitae elit libero, a pharetra augue mollis interdum.' },
    { src: 'images/carousel/slide2.png', title: 'Second slide label', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { src: 'images/carousel/slide3.png', title: 'Third slide label', description: 'Praesent commodo cursus magna, vel scelerisque nisl consectetur.' }
  ];
  aboutText: string = "";

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadAboutText();
  }

  loadAboutText(): void {
    this.aboutText = "FIFGROUP adalah perusahaan pembiayaan konvensional dan syariah bagi konsumen yang ingin membeli berbagai kebutuhan seperti pembiayaan motor Honda melalui FIFASTRA, pembiayaan elektronik dan perabotan rumah tangga melalui SPEKTRA, pinjaman tunai melalui DANASTRA, pembiayaan usaha melalui FINATRA, pembiayaan haji dan umroh serta pembelian emas melalui AMITRA";
  }

  navigateToInfoPage(page: string): void {
    this.router.navigate(['/info-page'], { queryParams: { page } });
  }
}
