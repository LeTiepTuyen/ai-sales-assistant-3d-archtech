-- Supabase pgvector schema for deployed RAG.
-- This file prepares the database shape only; cloud setup is optional until deployment is approved.

create schema if not exists extensions;
create extension if not exists vector with schema extensions;

create table if not exists rag_documents (
  id uuid primary key default gen_random_uuid(),
  document_id text not null unique,
  file_name text not null,
  source_path text not null,
  file_type text not null,
  document_type text not null,
  service_category text not null,
  file_size_bytes bigint not null,
  modified_at timestamptz,
  ingested_at timestamptz not null default now(),
  status text not null,
  extracted_characters integer not null default 0,
  chunk_count integer not null default 0,
  warnings jsonb not null default '[]'::jsonb,
  error text
);

create table if not exists rag_chunks (
  id uuid primary key default gen_random_uuid(),
  chunk_id text not null unique,
  document_id text not null references rag_documents(document_id) on delete cascade,
  document_name text not null,
  document_type text not null,
  service_category text not null,
  page_start integer,
  page_end integer,
  section_title text,
  text text not null,
  token_estimate integer not null default 0,
  embedding extensions.vector(768),
  created_at timestamptz not null default now()
);

alter table rag_documents enable row level security;
alter table rag_chunks enable row level security;

-- No anon/authenticated policies are created for the MVP.
-- Deployed RAG should be accessed from trusted server-side code using a Supabase secret/service-role key.

create index if not exists rag_documents_type_idx
  on rag_documents(document_type);

create index if not exists rag_documents_service_idx
  on rag_documents(service_category);

create index if not exists rag_chunks_document_idx
  on rag_chunks(document_id);

create index if not exists rag_chunks_type_service_idx
  on rag_chunks(document_type, service_category);

create index if not exists rag_chunks_embedding_hnsw_idx
  on rag_chunks using hnsw (embedding vector_cosine_ops);

create or replace function match_rag_chunks(
  query_embedding extensions.vector(768),
  match_threshold double precision default 0.2,
  match_count integer default 8,
  filter_document_type text default null,
  filter_service_category text default null
)
returns table (
  chunk_id text,
  document_id text,
  document_name text,
  document_type text,
  service_category text,
  page_start integer,
  page_end integer,
  section_title text,
  text text,
  similarity double precision
)
language sql
stable
as $$
  select
    rag_chunks.chunk_id,
    rag_chunks.document_id,
    rag_chunks.document_name,
    rag_chunks.document_type,
    rag_chunks.service_category,
    rag_chunks.page_start,
    rag_chunks.page_end,
    rag_chunks.section_title,
    rag_chunks.text,
    1 - (rag_chunks.embedding <=> query_embedding) as similarity
  from rag_chunks
  where rag_chunks.embedding is not null
    and (filter_document_type is null or rag_chunks.document_type = filter_document_type)
    and (filter_service_category is null or rag_chunks.service_category = filter_service_category)
    and 1 - (rag_chunks.embedding <=> query_embedding) > match_threshold
  order by rag_chunks.embedding <=> query_embedding
  limit match_count;
$$;

revoke execute on function match_rag_chunks(extensions.vector, double precision, integer, text, text)
  from anon, authenticated;
grant execute on function match_rag_chunks(extensions.vector, double precision, integer, text, text)
  to service_role;
