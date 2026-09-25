import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://rlcvxoktqtxrhmytrrvd.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsY3Z4b2t0cXR4cmhteXRycnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMzA3OTksImV4cCI6MjEwNTkwNjc5OX0.cZpcsVSvHwRc0iv9u9Eb1duqQlRl-R7_cz1f8sHTjMw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadDocument(file: File, folderName: string): Promise<string | null> {
  try {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${folderName}/${fileName}`;
    
    console.log(`[Supabase Storage] Uploading ${file.name} to Documents/${filePath}...`);
    const { data, error } = await supabase.storage
      .from('Documents')
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type || 'application/pdf'
      });
      
    if (error) {
      console.error('[Supabase Storage] Upload error:', error.message || error);
      return null;
    }
    
    console.log('[Supabase Storage] Upload success! Path:', data?.path);
    return data?.path || filePath;
  } catch (err) {
    console.error('[Supabase Storage] Unexpected upload error:', err);
    return null;
  }
}
