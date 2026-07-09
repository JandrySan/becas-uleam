import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wapndygnusbxhkraijcr.supabase.co';
const supabaseKey = 'sb_publishable_Xql8RBTLvwc9I1Fwbry3WQ_ah2a6rSX';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  client = createClient(supabaseUrl, supabaseKey);
}