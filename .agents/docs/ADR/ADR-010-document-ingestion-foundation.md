# Architecture Decision Record: Document Ingestion Foundation

## Status

**Status:** Accepted
**Date:** 2026-07-17

## Context

VeriFinca needs a robust and scalable document ingestion pipeline to support the primary objective of real estate fraud prevention through document validation. Documents uploaded by users (developers, validators) must be securely stored, hashed for integrity tracking, and analyzed via Optical Character Recognition (OCR) to extract relevant metadata and text.

The core requirements for the document ingestion pipeline are:
1.  **Storage:** Store uploaded documents in a scalable and durable object storage system.
2.  **Integrity:** Track the integrity of uploaded documents (e.g., via SHA-256 hash) to detect tampering and ensure traceability (OE-7).
3.  **Analysis:** Extract text and structured data from documents using OCR (OE-2).
4.  **State Management:** Track the processing state of each document (e.g., Uploaded, Processing, Verified, Rejected).
5.  **Local Development:** Ensure the system can be developed and tested locally without relying on paid cloud services.

## Decision

We have decided to implement a document ingestion pipeline with the following architectural choices:

1.  **Storage Emulation (Azurite):** We will use the Azure Storage SDK (`Azure.Storage.Blobs`) in the .NET backend to interact with Azure Blob Storage. For local development and testing, we will use Azurite to emulate Azure Blob Storage. This allows us to use the real Azure SDKs in code while avoiding cloud costs during development.
    *   `IBlobStorageService` interface abstracts the storage operations.
    *   `AzureBlobStorageService` implements the interface using `BlobServiceClient`.

2.  **Document Integrity (SHA-256):** We will compute a SHA-256 hash of every uploaded document before storing it. The hash will be stored in the SQL Server database alongside the document metadata. This provides a mechanism to verify document integrity later in the validation process.
    *   The `Documento` entity was extended with a `HashSHA256` property.

3.  **OCR Provider Abstraction:** We will abstract the OCR capability behind an `IOcrProvider` interface. This allows us to easily swap out OCR implementations (e.g., Azure AI Document Intelligence, PaddleOCR) without affecting the core application logic.
    *   A stub implementation, `PaddleOcrProvider`, was created to simulate OCR processing during local development.

4.  **State Transition Engine:** We will introduce a `DocumentStateEngine` (implementing `IDocumentStateEngine`) to manage the state transitions of a document based on OCR results and other validation checks. This separates the state logic from the main application service, improving testability and maintainability.
    *   The `Documento` entity manages its own state transitions (e.g., `StartProcessing()`, `CompleteProcessing()`) to enforce domain invariants.

## Consequences

### Positive

*   **Scalability:** The architecture is designed to scale by using cloud-native services (Azure Blob Storage) and abstracting computationally expensive tasks (OCR).
*   **Testability:** The use of interfaces (`IBlobStorageService`, `IOcrProvider`, `IDocumentStateEngine`) enables comprehensive unit testing with mocked dependencies.
*   **Local Development:** Azurite provides a seamless local development experience without requiring cloud connectivity.
*   **Flexibility:** The OCR abstraction allows for easy migration to different OCR providers as requirements evolve.
*   **Domain Integrity:** The `Documento` entity encapsulates its state logic, preventing invalid state transitions from being applied by application services.

### Negative

*   **Complexity:** The introduction of multiple interfaces and a state engine adds some complexity to the codebase.
*   **Stub Maintenance:** The `PaddleOcrProvider` stub must be maintained to accurately reflect the expected behavior of real OCR providers during development.

## Implementation Details

The implementation involved the following key steps:
1.  Adding the `Azure.Storage.Blobs` NuGet package to the `Infrastructure` project.
2.  Creating the `IBlobStorageService` and `AzureBlobStorageService` classes.
3.  Extending the `Documento` domain entity with `HashSHA256`, `ResultadoOcrJson`, and state transition methods.
4.  Creating the `IOcrProvider` interface and the `PaddleOcrProvider` stub.
5.  Implementing the `DocumentStateEngine` to orchestrate state changes based on OCR results.
6.  Updating the `DocumentService.UploadAsync` method to integrate the new components (hashing, storage, OCR, state transition).
7.  Adding comprehensive unit tests for the domain and application layers, adhering to strict TDD practices.
8.  Ensuring Playwright E2E tests for document upload continue to pass.
