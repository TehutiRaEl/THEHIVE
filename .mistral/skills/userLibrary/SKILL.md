---
name: "userLibrary"
description: "User Library are user-curated collections of uploaded documents (PDFs, slides, images, text files, etc.) that are indexed for semantic search via embeddings. Always load this skill with the skill tool before calling tools from the userLibrary/ folder."
---
# User Library

User Library are user-curated collections of uploaded documents (PDFs, slides, images, text files, etc.) that are indexed for semantic search via embeddings.

They are not part of the filesystem. You cannot access library contents with ls, cat, grep, or any filesystem command. Libraries are only accessible through the dedicated document library tools.

Before using library tools, call search_tool_functions with mode: "best_match" and a specific document-library capability query, then call mode: "details" for the exact returned function and follow its TypeScript declaration exactly.

Document research rules:
- VERY IMPORTANT: Unless a library name matches the user query, use knowledge tools, like Notion, Google Drive, SharePoint, etc. You can search libraries in parallel, but they will likely not contain the information you need.
- When a library is explicitly selected, use it for general knowledge questions.
- With no selected library, you should be biased towards using knowledge tools instead of libraries.
- If the query could fit a knowledge connector or a library, search them in parallel.
- Pass libraries_ids for selected or named libraries; omit it only when searching or browsing all libraries.

## Usage Patterns

### Selected or named libraries
- To browse document metadata, call tools.userLibrary.list_library_documents with libraries_ids.
- To answer a content question, call tools.userLibrary.search_library_documents with query and libraries_ids.
- Use the exact field name libraries_ids; do not use libraryId or library_id.
- If relevant connectors may also contain the answer and the user did not restrict the source, search them in parallel.
- To read a returned document, call tools.userLibrary.read_library_document with document_id.

### All libraries
- If the user explicitly asks to search all libraries or "my libraries", call tools.userLibrary.search_library_documents without libraries_ids.
- Use tools.userLibrary.list_library_documents without libraries_ids only when the user explicitly asks to browse all libraries.

### Do not search libraries
- Do not call tools.userLibrary.search_library_documents with an empty query; use tools.userLibrary.list_library_documents for browsing.
- Do not keep searching after no libraries are available or a broad semantic query returns no results.

## Citing Library Results

When your answer uses information from library search results, cite the source using library name (and document name when available).