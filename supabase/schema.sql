-- Clari Color: base para el panel de edición
-- Tablas: contenido (textos de la web), trabajos (galería), admins (quién puede editar)
-- Fotos: bucket público "fotos"

create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- nadie lee ni escribe admins desde la web; se maneja desde el dashboard de Supabase

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;

create table if not exists public.contenido (
  id text primary key,
  datos jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);
alter table public.contenido enable row level security;
create policy "contenido: todos leen" on public.contenido for select to anon, authenticated using (true);
create policy "contenido: admins crean" on public.contenido for insert to authenticated with check ((select public.es_admin()));
create policy "contenido: admins editan" on public.contenido for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

create table if not exists public.trabajos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null default '' check (char_length(titulo) <= 40),
  categoria text not null default 'color' check (categoria in ('color','corte','peinado','trans')),
  detalle text not null default '' check (char_length(detalle) <= 30),
  foto text not null default '',
  visible boolean not null default true,
  orden integer not null default 0,
  creado timestamptz not null default now()
);
create index if not exists trabajos_orden_idx on public.trabajos (orden);
alter table public.trabajos enable row level security;
create policy "trabajos: todos ven los visibles" on public.trabajos for select to anon using (visible);
create policy "trabajos: admins ven todos" on public.trabajos for select to authenticated using (visible or (select public.es_admin()));
create policy "trabajos: admins crean" on public.trabajos for insert to authenticated with check ((select public.es_admin()));
create policy "trabajos: admins editan" on public.trabajos for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "trabajos: admins borran" on public.trabajos for delete to authenticated using ((select public.es_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;
create policy "fotos: admins suben" on storage.objects for insert to authenticated with check (bucket_id = 'fotos' and (select public.es_admin()));
create policy "fotos: admins cambian" on storage.objects for update to authenticated using (bucket_id = 'fotos' and (select public.es_admin()));
create policy "fotos: admins borran" on storage.objects for delete to authenticated using (bucket_id = 'fotos' and (select public.es_admin()));

insert into public.contenido (id, datos) values ('sitio', '{"inicio": {"etiqueta": "Estilista & coach ontológica · Quilmes", "frase": "Transformar tu imagen también puede transformar cómo te ves.", "texto": "Un espacio donde la peluquería, el coaching y el oráculo se unen para acompañarte a verte y sentirte bien, por dentro y por fuera.", "boton1": "Conocé mi trabajo", "boton2": "Reservar turno", "titulo_servicios": "Lo que hago", "titulo_trabajos": "Últimos trabajos"}, "cta": {"titulo": "¿Lista para tu cambio?", "boton": "Reservar turno"}, "sobre": {"etiqueta": "Hola, soy Clari", "bajada": "Estilista y coach ontológica. Acompaño transformaciones por dentro y por fuera.", "foto": "", "destacado": "Siempre creí que el cabello es mucho más que pelo: es memoria, identidad y reflejo de lo que llevamos dentro.", "parrafo1": "Soy estilista y coach ontológica. Por eso uní la peluquería con el coaching y el oráculo, y así nació este espacio donde trabajamos por dentro y por fuera.", "parrafo2": "Cada clienta es única. Te escucho, te aconsejo y creamos juntas el resultado. Cada turno es una pausa, un momento para encontrarte.", "titulo_resenas": "Reseñas", "etiqueta_resenas": "Lo que dicen mis clientas"}, "servicios": [{"titulo": "Color", "texto": "Balayage, mechas, rubios y coloración completa."}, {"titulo": "Corte", "texto": "Cortes y peinados según tu rostro y tu rutina."}, {"titulo": "Coaching", "texto": "Sesiones de coaching ontológico y oráculo."}], "resenas": [{"texto": "Excelente colorista. Voy hace 10 años y cada día se supera. Te escucha, te interpreta y te cuida el cabello.", "autor": "Romina Souse"}, {"texto": "La mejor colorista por lejos. Entiende a la perfección lo que querés y te asesora con total honestidad.", "autor": "Donatella Brizzola"}, {"texto": "Me encantó conocer a Clari, y el color final de mi pelito habla por sí solo.", "autor": "Lisseth Toapanta"}], "trabajos": {"etiqueta": "Mi trabajo habla por mí", "bajada": "Una selección de transformaciones reales: color, cortes, peinados y cambios completos."}, "contacto": {"etiqueta": "Turnos por WhatsApp", "bajada": "¿Querés conocer más? Escribime y te respondo en menos de 24 horas hábiles.", "whatsapp": "5491123456789", "whatsapp_visible": "+54 9 11 2345-6789", "instagram": "claricolor.ok", "email": "hola@claricolor.com.ar", "ubicacion": "Quilmes, Buenos Aires", "horarios": "Lunes a sábado · 10 a 19 h", "opciones": ["Corte de pelo", "Coloración / balayage", "Tratamiento capilar", "Peinado / evento", "Transformación integral", "Sesión de coaching", "Oráculo", "Otro"]}}'::jsonb)
on conflict (id) do nothing;
