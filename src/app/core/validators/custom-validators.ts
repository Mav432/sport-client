import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

/**
 * Validadores personalizados para seguridad y UX
 */

// ============================================================================
// EMAIL VALIDATION
// ============================================================================
export function emailFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    // Regex RFC 5322 simplificado pero efectivo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(control.value);

    return valid ? null : { invalidEmailFormat: { value: control.value } };
  };
}

// ============================================================================
// PASSWORD VALIDATION - Complejidad
// ============================================================================
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export function passwordComplexityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const errors: string[] = [];

    // Longitud mínima 8
    if (password.length < 8) {
      errors.push('min-length');
    }

    // Al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('uppercase');
    }

    // Al menos una minúscula
    if (!/[a-z]/.test(password)) {
      errors.push('lowercase');
    }

    // Al menos un número
    if (!/[0-9]/.test(password)) {
      errors.push('digit');
    }

    // Al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('special-char');
    }

    return errors.length > 0 ? { passwordComplexity: errors } : null;
  };
}

/**
 * Evalúa la fortaleza de una contraseña (sin validar, solo medir)
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return { score: 0, feedback: ['Ingresa una contraseña'], isValid: false };
  }

  // Longitud
  if (password.length >= 8) score++;
  else feedback.push('Mínimo 8 caracteres');

  if (password.length >= 12) score++;
  else feedback.push('Considera 12+ caracteres');

  // Complejidad
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Agrega mayúsculas');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Agrega minúsculas');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Agrega números');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  else feedback.push('Agrega caracteres especiales');

  // Normalizar score a 0-4
  const normalizedScore = Math.min(Math.floor(score / 1.5), 4);

  return {
    score: normalizedScore,
    feedback: feedback.slice(0, 2), // Mostrar solo los 2 primeros consejos
    isValid: normalizedScore >= 3 && password.length >= 8
  };
}

// ============================================================================
// NAME VALIDATION
// ============================================================================
export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const name = control.value.trim();
    const errors: string[] = [];

    // Longitud: 2-50 caracteres
    if (name.length < 2) {
      errors.push('min-length');
    }
    if (name.length > 50) {
      errors.push('max-length');
    }

    // Solo letras, espacios, guiones y acentos
    const validNameRegex = /^[a-záéíóúàèìòùäëïöüñ\s\-']+$/i;
    if (!validNameRegex.test(name)) {
      errors.push('invalid-characters');
    }

    return errors.length > 0 ? { invalidName: errors } : null;
  };
}

// ============================================================================
// XSS DETECTION - Detecta patrones peligrosos
// ============================================================================
export function xssPatternDetector(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const input = control.value.toString();
    const xssPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // onclick, onerror, etc.
      /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
      /<img[^>]*onerror/gi,
      /<svg[^>]*onload/gi,
      /eval\(/gi,
      /expression\(/gi
    ];

    const hasXSS = xssPatterns.some(pattern => pattern.test(input));

    return hasXSS ? { xssDetected: { value: control.value } } : null;
  };
}

// ============================================================================
// SQL INJECTION DETECTION - Detecta patrones sospechosos
// ============================================================================
export function sqlInjectionDetector(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const input = control.value.toString().toLowerCase();
    const sqlPatterns = [
      /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(['";][\s\n]*(OR|AND)[\s\n]*['"];?)/gi,
      /(--\/\*|\*\/)/gi, // Solo comentarios SQL sin #
      /(\bOR\b.*=.*)/gi,
      /(\b1\s*=\s*1\b)/gi,
      /(;\s*(DROP|DELETE|TRUNCATE))/gi
    ];

    // Pero permitir ciertos contextos seguros
    const isEmail = input.includes('@');
    if (isEmail) return null; // Los emails pueden tener caracteres especiales

    const hasSQLInjection = sqlPatterns.some(pattern => pattern.test(input));

    return hasSQLInjection ? { sqlInjectionDetected: { value: control.value } } : null;
  };
}

// ============================================================================
// SECURE INPUT - Combina XSS + SQL detectors
// ============================================================================
export function secureInputValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const xssCheck = xssPatternDetector()(control);
    const sqlCheck = sqlInjectionDetector()(control);

    if (xssCheck || sqlCheck) {
      return {
        insecureInput: {
          xss: !!xssCheck,
          sql: !!sqlCheck
        }
      };
    }

    return null;
  };
}

// ============================================================================
// MATCH VALIDATOR - Para confirmar contraseñas
// ============================================================================
export function passwordMatchValidator(passwordField: string, confirmField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField);
    const confirm = control.get(confirmField);

    if (!password || !confirm) {
      return null;
    }

    return password.value === confirm.value ? null : { passwordMismatch: true };
  };
}

// ============================================================================
// FUNCIONES AUXILIARES DE VALIDACIÓN (sin FormControl)
// ============================================================================

/**
 * Valida formato de email directamente
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida complejidad de contraseña directamente
 */
export function validatePasswordComplexity(password: string): boolean {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  return true;
}

/**
 * Valida nombre directamente
 */
export function validateName(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  const validNameRegex = /^[a-záéíóúàèìòùäëïöüñ\s\-']+$/i;
  return validNameRegex.test(trimmed);
}

/**
 * Detecta XSS patterns directamente
 */
export function detectXSS(input: string): boolean {
  if (!input) return false;
  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /<img[^>]*onerror/gi,
    /<svg[^>]*onload/gi,
    /eval\(/gi,
    /expression\(/gi
  ];
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Detecta SQL Injection patterns directamente
 */
export function detectSQLInjection(input: string): boolean {
  if (!input) return false;
  const isEmail = input.includes('@');
  if (isEmail) return false;

  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(['";][\s\n]*(OR|AND)[\s\n]*['"];?)/gi,
    /(--\/\*|\*\/)/gi, // Solo comentarios SQL sin #
    /(\bOR\b.*=.*)/gi,
    /(\b1\s*=\s*1\b)/gi,
    /(;\s*(DROP|DELETE|TRUNCATE))/gi
  ];
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Valida entrada segura (sin XSS ni SQL injection)
 */
export function isSecureInput(input: string): boolean {
  if (!input) return true;
  return !detectXSS(input) && !detectSQLInjection(input);
}
