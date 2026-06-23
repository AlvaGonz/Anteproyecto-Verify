# /new-feature

**Purpose:** Start the feature delivery process — Architect → Developer → Reviewer.

## Usage

```
/new-feature <feature-name> [--description=<text>] [--trd-section=<section>] [--skip-architect]
```

## Options

| Option | Description |
|--------|-------------|
| `--description` | Brief description of the feature |
| `--trd-section` | TRD section reference (e.g., "§9, RF-4") |
| `--skip-architect` | Skip architecture phase (use when spec already exists) |

## Examples

```
/new-feature "TransUnion credit check integration" --trd-section="§3, RF-9"
/new-feature "Add document upload validation" --trd-section="§4, RF-2" --skip-architect
```

## Process

1. Loads `workflows/feature-delivery-workflow.md`
2. If `--skip-architect`:
   - Route directly to `@developer-agent` with the feature spec
3. Otherwise:
   - Route to `@architect-agent` for spec + diagrams
   - After spec approval, route to `@developer-agent`
   - After implementation, route to `@reviewer-agent`
4. After all stages complete, present summary

## Output

```
/new-feature "Implement consent management UI"
  └─ Stage 1: @architect-agent → Updating consent flow diagram...
  └─ Stage 2: @developer-agent → Implementing RecordConsentCommand...
  └─ Stage 3: @reviewer-agent → Reviewing consent guard...
  └─ ✅ Feature complete — see summary below
```

## Related

- Loads `context/processes/feature-delivery-process.md`
- Loads `context/standards/code-quality-standards.md`
- References `.agents/docs/TRD_VeriFinca.md` (relevant section)
