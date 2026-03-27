-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.grados (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  persona_id uuid,
  institucion_id uuid,
  programa_id uuid,
  fecha_inicio date,
  fecha_fin date,
  titulo_obtenido character varying,
  numero_cedula character varying,
  titulo_tesis text,
  menciones character varying,
  hash_actual text NOT NULL,
  hash_anterior text,
  nonce integer,
  firmado_por character varying,
  creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT grados_pkey PRIMARY KEY (id),
  CONSTRAINT grados_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id),
  CONSTRAINT grados_institucion_id_fkey FOREIGN KEY (institucion_id) REFERENCES public.instituciones(id),
  CONSTRAINT grados_programa_id_fkey FOREIGN KEY (programa_id) REFERENCES public.programas(id)
);
CREATE TABLE public.instituciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  pais character varying,
  estado character varying,
  creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT instituciones_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mempool (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  persona_id uuid,
  institucion_id uuid,
  programa_id uuid,
  fecha_inicio date,
  fecha_fin date,
  titulo_obtenido character varying,
  numero_cedula character varying,
  titulo_tesis text,
  menciones character varying,
  creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT mempool_pkey PRIMARY KEY (id),
  CONSTRAINT mempool_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id),
  CONSTRAINT mempool_institucion_id_fkey FOREIGN KEY (institucion_id) REFERENCES public.instituciones(id),
  CONSTRAINT mempool_programa_id_fkey FOREIGN KEY (programa_id) REFERENCES public.programas(id)
);
CREATE TABLE public.niveles_grado (
  id integer NOT NULL DEFAULT nextval('niveles_grado_id_seq'::regclass),
  nombre character varying NOT NULL,
  CONSTRAINT niveles_grado_pkey PRIMARY KEY (id)
);
CREATE TABLE public.nodos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  url character varying NOT NULL UNIQUE,
  nombre character varying,
  activo boolean DEFAULT true,
  creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT nodos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.personas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  apellido_paterno character varying NOT NULL,
  apellido_materno character varying,
  curp character varying UNIQUE,
  correo character varying,
  creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT personas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.programas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  nivel_grado_id integer,
  creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT programas_pkey PRIMARY KEY (id),
  CONSTRAINT programas_nivel_grado_id_fkey FOREIGN KEY (nivel_grado_id) REFERENCES public.niveles_grado(id)
);