import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.generated';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  readonly client: SupabaseClient;

  constructor() {
    if (!environment.supabaseUrl) {
      throw new Error(
        'No se configuró la URL de Supabase para Angular.'
      );
    }

    if (!environment.supabaseAnonKey) {
      throw new Error(
        'No se configuró la clave pública de Supabase para Angular.'
      );
    }

    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }
}