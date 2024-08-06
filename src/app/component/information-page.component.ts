import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-info-page',
  templateUrl: './information-page.component.html',
  styleUrls: ['./information-page.component.css']
})
export class InfoPageComponent implements OnInit {
  page: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.page = params['page'];
    });
  }
}
