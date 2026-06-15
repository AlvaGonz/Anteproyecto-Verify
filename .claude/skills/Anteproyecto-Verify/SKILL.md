```markdown
# Anteproyecto-Verify Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill introduces the core development patterns and conventions used in the Anteproyecto-Verify repository, a C# codebase with a focus on clear structure and maintainable code. You'll learn about file naming, import/export styles, commit conventions, and how to write and organize tests.

## Coding Conventions

### File Naming
- Use **PascalCase** for all file names.
  - **Example:** `UserService.cs`, `VerificationManager.cs`

### Import Style
- Use **relative imports** to reference other files within the project.
  - **Example:**
    ```csharp
    using ProjectNamespace.Services;
    ```

### Export Style
- Use **named exports** for classes and functions.
  - **Example:**
    ```csharp
    public class VerificationManager
    {
        // Implementation
    }
    ```

### Commit Message Patterns
- Follow **Conventional Commits** with the `feat` prefix for new features.
  - **Example:**
    ```
    feat: add user verification logic to VerificationManager
    ```

## Workflows

### Feature Development
**Trigger:** When implementing a new feature  
**Command:** `/feature-development`

1. Create a new branch for your feature.
2. Implement the feature in a new or existing PascalCase-named file.
3. Use relative imports for dependencies.
4. Export classes/functions using named exports.
5. Write or update tests in corresponding `*.test.*` files.
6. Commit changes using the `feat` prefix and a clear, descriptive message.
7. Open a pull request for review.

### Testing
**Trigger:** When validating code changes  
**Command:** `/run-tests`

1. Identify or create test files matching the `*.test.*` pattern.
2. Write tests for new or updated code.
3. Run the test suite using the project's test runner (framework unspecified).
4. Ensure all tests pass before merging changes.

## Testing Patterns

- Test files follow the `*.test.*` naming convention.
  - **Example:** `VerificationManager.test.cs`
- Testing framework is unspecified; use standard C# testing practices.
- Place test files alongside or in a dedicated test directory.

**Example Test File:**
```csharp
using Xunit;
using ProjectNamespace;

public class VerificationManagerTests
{
    [Fact]
    public void Should_Verify_User_Successfully()
    {
        // Arrange
        var manager = new VerificationManager();

        // Act
        bool result = manager.VerifyUser("testUser");

        // Assert
        Assert.True(result);
    }
}
```

## Commands
| Command             | Purpose                                   |
|---------------------|-------------------------------------------|
| /feature-development| Start a new feature development workflow  |
| /run-tests          | Run the test suite for the project        |
```
