# UC Emprende (Supabase)
1. Crea un proyecto gratis en supabase.com.
2. SQL Editor > pega todo `supabase.sql` > Run.
3. Authentication > Providers > Email: desactiva "Confirm email" (para que entren sin confirmar correo).
4. Project Settings > API: copia "Project URL" y la clave "anon public" en `js/config.js`.
5. Abre la carpeta en VS Code y usa Live Server.
6. Regístrate, y vuelve al SQL Editor para convertirte en admin (última línea de supabase.sql).
7. Publicar: arrastra la carpeta a app.netlify.com/drop (o usa Vercel / GitHub Pages / Cloudflare Pages).
La clave anon es pública por diseño; la seguridad la dan las reglas (RLS) del SQL.
