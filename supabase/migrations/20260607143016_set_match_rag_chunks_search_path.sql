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
set search_path = public, extensions
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
    1 - (rag_chunks.embedding OPERATOR(extensions.<=>) query_embedding) as similarity
  from rag_chunks
  where rag_chunks.embedding is not null
    and (filter_document_type is null or rag_chunks.document_type = filter_document_type)
    and (filter_service_category is null or rag_chunks.service_category = filter_service_category)
    and 1 - (rag_chunks.embedding OPERATOR(extensions.<=>) query_embedding) > match_threshold
  order by rag_chunks.embedding OPERATOR(extensions.<=>) query_embedding
  limit match_count;
$$;
