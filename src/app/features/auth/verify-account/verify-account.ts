import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-account.html', // asegúrate que el nombre coincide con tu archivo .html
})
export class VerifyAccountComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  form!: FormGroup; // inicializamos luego
  email = '';
  from: 'login' | 'register' | 'other' = 'other';
  info = '';
  loading = false;
  error: string | null = null;
  resendCooldown = 0;
  private cooldownRef: any = null;
  private routeSub: Subscription | null = null;

  ngOnInit(): void {
    // crear form ahora que fb está disponible
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    // Leer query params: ?email=...&from=login|register
    this.routeSub = this.route.queryParams.subscribe((params) => {
      this.email = (params['email'] || '').toString();
      const f = (params['from'] || '').toString().toLowerCase();
      this.from = f === 'login' || f === 'register' ? f : 'other';
      this.info = this.email
        ? `Se ha enviado (o se enviará) un código de 6 dígitos a ${this.email}.`
        : 'Ingresa tu correo para recibir el código.';

      // AUTO-REENVIO: enviar el código automáticamente al llegar desde login/register
      if (this.email && this.from !== 'register') {
        this.autoResendIfNeeded();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    this.clearCooldown();
  }

  submit(): void {
    this.error = null;
    if (this.form.invalid || !this.email) {
      this.error = 'Ingresa un código válido y un correo.';
      return;
    }

    const code = this.form.value.code;
    this.loading = true;

    this.auth.verifyRecoveryCode(this.email, code).subscribe({
      next: () => {
        this.loading = false;
        // redirigir al login tras verificación
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Código inválido o expirado.';
      },
    });
  }

  resend(): void {
    this.error = null;
    if (!this.email || this.resendCooldown > 0) return;

    this.loading = true;
    // preferimos requestResendCode si existe, si no usamos requestPasswordReset
    const resend$ =
      typeof (this.auth as any).requestResendCode === 'function'
        ? (this.auth as any).requestResendCode(this.email)
        : this.auth.requestPasswordReset(this.email);

    resend$.subscribe({
      next: () => {
        this.loading = false;
        this.info = `Código reenviado a ${this.email}. Revisa tu bandeja de entrada.`;
        this.startCooldown(60);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'No se pudo reenviar el código.';
      },
    });
  }

  /**
   * Enviar automáticamente el código la primera vez que se entra con un email.
   * Usa sessionStorage para evitar reenvíos en refresh/ navegación atrás.
   */
  private autoResendIfNeeded() {
    if (!this.email) return;

    const key = `sc_resend_sent_${this.email}`;
    const last = sessionStorage.getItem(key);
    const now = Date.now();

    // Si el último envío fue hace < 60s evitamos volver a enviar
    if (last && now - Number(last) < 60_000) {
      // iniciar cooldown visual si quieres (ej. 60 - elapsed)
      const elapsed = Math.floor((now - Number(last)) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      if (remaining > 0) this.startCooldown(remaining);
      return;
    }

    // Seleccionar método de reenvío disponible en AuthService
    const resend$ =
      typeof (this.auth as any).requestResendCode === 'function'
        ? (this.auth as any).requestResendCode(this.email)
        : this.auth.requestPasswordReset(this.email);

    this.loading = true;
    resend$.subscribe({
      next: () => {
        this.loading = false;
        sessionStorage.setItem(key, String(Date.now()));
        this.info = `Se ha enviado un código a ${this.email}. Revisa tu bandeja de entrada.`;
        this.startCooldown(60);
      },
      error: (err: any) => {
        this.loading = false;
        // no guardar timestamp en caso de error
        this.error = err?.error?.message || 'No fue posible enviar el código automáticamente.';
      },
    });
  }

  startCooldown(seconds: number) {
    this.clearCooldown();
    this.resendCooldown = seconds;
    this.cooldownRef = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) this.clearCooldown();
    }, 1000);
  }

  clearCooldown() {
    if (this.cooldownRef) {
      clearInterval(this.cooldownRef);
      this.cooldownRef = null;
    }
    this.resendCooldown = 0;
  }

  cancel(): void {
    this.router.navigate(['/auth/login']);
  }
}
