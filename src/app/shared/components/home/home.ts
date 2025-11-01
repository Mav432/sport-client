import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private toastr = Inject(ToastrService);

  testNotification() {
    this.toastr.success('¡Hola! Bienvenido a nuestra tienda.', 'Éxito');
  }
}
