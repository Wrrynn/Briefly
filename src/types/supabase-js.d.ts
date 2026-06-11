declare module '@supabase/supabase-js' {
    export function createClient(url: string, key: string, options?: any): any;
    export const SupabaseClient: any;
    export default SupabaseClient;
}
