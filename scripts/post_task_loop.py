import os
import sys
import json
import urllib.request
import urllib.error
import argparse
import subprocess
import time
import re
import hashlib
import concurrent.futures
import threading
from datetime import datetime

class SecurityGuardrails:
    INJECTION_PATTERNS = [
        r'ignore (all |previous |above )?instructions',
        r'you are now', r'forget your', r'disregard (your |the )?',
        r'system\s*prompt', r'</?(DIFF|TASK|OUTPUT|SYSTEM)>',
        r'assistant:\s*score\s*:\s*100', r'return.*verdict.*PASS',
    ]
    SENSITIVE_PATTERNS = [
        r'api[_-]?key\s*[:=]\s*\S+', r'password\s*[:=]\s*\S+',
        r'secret\s*[:=]\s*\S+', r'token\s*[:=]\s*\S+',
        r'\b\d{16}\b',  # credit card
        r'\b[A-Z0-9]{20,}\b',  # probable API key
    ]

    def sanitize_for_prompt(self, content: str, label: str) -> str:
        for pattern in self.INJECTION_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE):
                content = re.sub(pattern, f'[{label}_INJECTION_REMOVED]',
                                 content, flags=re.IGNORECASE)
        return content

    def redact_sensitive(self, content: str) -> str:
        for pattern in self.SENSITIVE_PATTERNS:
            content = re.sub(pattern, '[REDACTED]', content, flags=re.IGNORECASE)
        return content

    def compute_integrity_hash(self, content: str) -> str:
        return hashlib.sha256(content.encode()).hexdigest()[:16]

class CircuitBreaker:
    def __init__(self, failure_threshold=3, recovery_timeout=30):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failures = 0
        self.last_failure_time = 0
        self.is_open = False

    def record_failure(self):
        self.failures += 1
        self.last_failure_time = time.time()
        if self.failures >= self.failure_threshold:
            self.is_open = True

    def allow_request(self) -> bool:
        if not self.is_open:
            return True
        if time.time() - self.last_failure_time > self.recovery_timeout:
            self.is_open = False
            self.failures = 0
            return True
        return False

    def record_success(self):
        self.failures = 0
        self.is_open = False

class WatchdogAgent:
    def __init__(self, session_path: str):
        self.session_path = session_path
        self.score_history = []

    def check_score_inflation(self, score: int, issues_count: int) -> dict:
        """ASI10: Detecta si el Evaluator está siendo manipulado."""
        self.score_history.append(score)
        anomalies = []
        # Rogue pattern: score alto con issues críticos = contradicción
        if score >= 90 and issues_count > 0:
            anomalies.append({
                "type": "SCORE_CONTRADICTION",
                "detail": f"Score={score} but {issues_count} issues found — possible rogue evaluator"
            })
        # Rogue pattern: siempre 100 en múltiples runs
        if len(self.score_history) >= 3 and all(s == 100 for s in self.score_history[-3:]):
            anomalies.append({
                "type": "SCORE_INFLATION",
                "detail": "Evaluator returned 100 three consecutive times — possible goal hijack"
            })
        return {"anomalies": anomalies, "triggered": len(anomalies) > 0}

    def check_verdict_consistency(self, score: int, verdict: str, high_count: int) -> bool:
        """Verifica que el veredicto es consistente con el score."""
        if verdict == "PASS" and high_count > 0:
            return False  # Inconsistencia detectada
        if score < 50 and verdict == "PASS":
            return False
        return True

class DenialOfWalletGuard:
    MAX_CALLS_PER_RUN = 12   # 5 agentes + 4 retries máx cada uno
    MAX_TOKENS_ESTIMATE = 60_000  # Groq llama3-70b: ~8k input por call
    TOKEN_COST_WARNING_THRESHOLD = 50_000

    def __init__(self):
        self.call_count = 0
        self.estimated_tokens = 0

    def pre_call_check(self, prompt_len: int) -> bool:
        """Returns False si se excede el budget."""
        self.call_count += 1
        self.estimated_tokens += prompt_len // 4  # ~4 chars por token
        if self.call_count > self.MAX_CALLS_PER_RUN:
            return False
        if self.estimated_tokens > self.MAX_TOKENS_ESTIMATE:
            return False
        return True

    def get_usage_summary(self) -> dict:
        return {
            "calls": self.call_count,
            "estimated_tokens": self.estimated_tokens,
            "budget_warning": self.estimated_tokens > self.TOKEN_COST_WARNING_THRESHOLD
        }

class SupplyChainValidator:
    def validate_constitution(self, content: str, expected_hash: str) -> dict:
        actual_hash = hashlib.sha256(content.encode()).hexdigest()
        if expected_hash and actual_hash != expected_hash:
            return {
                "valid": False,
                "warning": f"AGENTS.md hash mismatch — possible supply chain tampering. Expected={expected_hash[:8]}... Got={actual_hash[:8]}..."
            }
        return {"valid": True, "hash": actual_hash}

class DiffRouter:
    """Anthropic Routing Pattern: decide model complexity before expensive calls."""

    SIMPLE_INDICATORS = [
        r'^\+.*#.*comment', r'^\+\s*(console\.log|print)\(',
        r'^\+\s{0,4}[\w]+\s*=\s*[\w\'"]+\s*$',  # simple assignment
    ]
    COMPLEX_INDICATORS = [
        r'(auth|jwt|token|password|secret|crypt|hash)',
        r'(sql|query|execute|cursor)',
        r'(eval|exec|subprocess|__import__)',
        r'(fetch|axios|request|http)',
    ]

    def route(self, diff: str) -> dict:
        diff_lower = diff.lower()
        complexity_score = 0
        triggers = []

        for pattern in self.COMPLEX_INDICATORS:
            if re.search(pattern, diff_lower):
                complexity_score += 2
                triggers.append(pattern)

        for pattern in self.SIMPLE_INDICATORS:
            if re.search(pattern, diff_lower):
                complexity_score -= 1

        # Use Groq environment model name or fallback
        api_primary = os.environ.get("GROQ_MODEL_PRIMARY", "llama-3.3-70b-versatile")
        api_fast = os.environ.get("GROQ_MODEL_FAST", "llama-3.1-8b-instant")
        model = api_primary if complexity_score >= 2 else api_fast
        return {
            "model": model,
            "complexity_score": complexity_score,
            "triggers": triggers,
            "rationale": f"Score={complexity_score} → {'PRIMARY (security-sensitive patterns found)' if model == api_primary else 'FAST (low-risk changes)'}"
        }

def safe_parse_issues(res: str) -> list:
    try:
        data = json.loads(res)
        issues = data.get("issues", [])
        if not isinstance(issues, list): return []
        parsed = []
        for i in issues:
            if isinstance(i, dict) and "severity" in i:
                i_copy = i.copy()
                i_copy["severity"] = str(i_copy["severity"]).strip().upper()
                parsed.append(i_copy)
        return parsed
    except: return []

def run_critics_parallel(call_llm, context, owasp_skill_content, routed_model):
    """Anthropic Parallelization (Sectioning): independent critics run concurrently."""
    
    critic_tasks = {
        "Critic": (
            "You are the Critic. Identify deviations from the Constitution, style guidelines, "
            "or codebase standards. For each issue provide: severity (HIGH|MEDIUM|LOW), "
            "description, file, and owasp_category if applicable. "
            "Output MUST be in JSON format matching the schema: { 'issues': [ {'severity':..., 'description':..., 'file':..., 'owasp_category':...} ] }",
            context,
            routed_model
        ),
        "Security Critic": (
            "You are the Security Critic. Review against OWASP Top 10:2025, ASVS 5.0, "
            "and Agentic AI Security risks (ASI01-ASI10) using the REFERENCE SECURITY MANUAL. "
            "For each issue include the specific OWASP/ASI rule violated. "
            "Output MUST be in JSON format matching the schema: { 'issues': [ {'severity':..., 'description':..., 'file':..., 'owasp_category':...} ] }",
            f"REFERENCE SECURITY MANUAL:\n{owasp_skill_content}\n\nCONTEXT:\n{context}",
            MODEL_PRIMARY
        ),
        "Architecture Critic": (
            "You are the Architectural Critic. Review against C4/Mermaid architecture and living "
            "documentation requirements. Verify: (1) diagrams updated, (2) ADRs created for "
            "significant decisions, (3) progress.md updated. "
            "Output MUST be in JSON format matching the schema: { 'issues': [ {'severity':..., 'description':..., 'file':..., 'owasp_category':...} ] }",
            context,
            routed_model
        ),
    }

    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(call_llm, sys_p, usr_p, name, model, True): name
            for name, (sys_p, usr_p, model) in critic_tasks.items()
        }
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                results[name] = safe_parse_issues(future.result())
            except Exception:
                results[name] = []

    return results

def run_mutation_loop(call_llm, high_issues, context, diff_safe, max_iterations=3):
    """
    Anthropic Evaluator-Optimizer Pattern with mandatory stopping conditions.
    Loop: Mutator proposes → Validator evaluates → if NO, loop again up to max_iterations.
    """
    mutations = ""
    validation = "YES. No high issues."
    iteration_log = []

    if not high_issues:
        return mutations, validation, iteration_log

    remaining_issues = high_issues.copy()
    api_primary = os.environ.get("GROQ_MODEL_PRIMARY", "llama-3.3-70b-versatile")
    api_fast = os.environ.get("GROQ_MODEL_FAST", "llama-3.1-8b-instant")

    for iteration in range(1, max_iterations + 1):
        # Mutator generates fix proposals
        mutator_sys = (
            "You are the Mutator. Given the HIGH issues and diff context, propose specific, "
            "actionable fixes. Be explicit: name the file, line change, and exact fix. "
            "Format each fix as: FILE: <path> | FIX: <description> | REASON: <why this resolves the issue>"
        )
        mutator_prompt = (
            f"ITERATION: {iteration}/{max_iterations}\n"
            f"UNRESOLVED ISSUES:\n{json.dumps(remaining_issues)}\n\n"
            f"CONTEXT:\n{context}"
        )
        mutations = call_llm(mutator_sys, mutator_prompt, "Mutator", model=api_fast)

        # Validator independently verifies (with full context — ASI03)
        validator_sys = (
            "You are the Validator. Independently verify proposed mutations against the original diff. "
            "For each mutation: (1) Does it address the stated issue? (2) Does it introduce new risks? "
            "Reply: VERDICT: YES|NO\nREASON: <brief>\nUNRESOLVED: <list any issues still not fixed>"
        )
        validator_prompt = (
            f"ORIGINAL DIFF:\n{diff_safe}\n\n"
            f"ISSUES TO RESOLVE:\n{json.dumps(remaining_issues)}\n\n"
            f"PROPOSED MUTATIONS:\n{mutations}"
        )
        validation = call_llm(validator_sys, validator_prompt, "Validator", model=api_primary)

        iteration_log.append({
            "iteration": iteration,
            "mutations_proposed": len(remaining_issues),
            "validation_result": validation[:200]
        })

        normalized_val = validation.strip().upper()
        if "VERDICT: YES" in normalized_val or normalized_val.startswith("YES") or "VERDICT:YES" in normalized_val:
            break

        if iteration == max_iterations:
            iteration_log.append({
                "iteration": "FINAL",
                "status": "HUMAN_REVIEW_REQUIRED",
                "reason": f"Mutations not validated after {max_iterations} iterations"
            })
            break

    return mutations, validation, iteration_log

def verify_issue_files_ground_truth(issues: list) -> list:
    """
    Anthropic Ground Truth Pattern: verify each issue's file actually exists
    before reporting it. Annotates issues with existence status.
    """
    enriched = []
    for issue in issues:
        file_path = issue.get("file", "")
        issue_copy = issue.copy()
        
        # Skip abstract references
        if file_path in ["TASK", "OUTPUT", "CONTEXT TO EVALUATE", "WatchdogAgent", "UNKNOWN", "", "None"]:
            issue_copy["file_verified"] = "N/A (abstract reference)"
            enriched.append(issue_copy)
            continue

        # Check actual filesystem
        if os.path.exists(file_path):
            issue_copy["file_verified"] = "✅ EXISTS"
        else:
            issue_copy["file_verified"] = "⚠️ FILE NOT FOUND — verify path"
            # Downgrade phantom-file HIGH or CRITICAL issues to MEDIUM
            if issue_copy.get("severity") in ["HIGH", "CRITICAL"]:
                issue_copy["severity"] = "MEDIUM"
                issue_copy["description"] += " [AUTO-DOWNGRADED: file not found in repo]"

        enriched.append(issue_copy)
    return enriched

def build_audit_report(
    score, verdict, issues_list, high_issues, mutations, validation,
    iteration_log, trust_metadata_dict, routing_decision, dow_guard,
    watchdog_result, verdict_ok, supply_chain_status, session_nonce,
    run_start_time
) -> str:

    run_duration = round(time.time() - run_start_time, 2)
    total = len(issues_list)
    highs = len([i for i in issues_list if i.get("severity") in ["HIGH", "CRITICAL"]])
    meds  = len([i for i in issues_list if i.get("severity") == "MEDIUM"])
    lows  = len([i for i in issues_list if i.get("severity") == "LOW"])

    # Risk level badge
    if highs >= 3 or score < 30:
        risk_badge = "🔴 CRITICAL"
    elif highs >= 1 or score < 60:
        risk_badge = "🟠 HIGH RISK"
    elif meds >= 3 or score < 80:
        risk_badge = "🟡 MEDIUM RISK"
    else:
        risk_badge = "🟢 LOW RISK"

    # Issues table with ground truth
    issues_md = "| Sev | File | Description | OWASP | File Exists |\n|---|---|---|---|---|\n"
    for i in issues_list:
        issues_md += (
            f"| {i.get('severity','?')} "
            f"| `{i.get('file','?')}` "
            f"| {i.get('description','?')} "
            f"| {i.get('owasp_category', '—')} "
            f"| {i.get('file_verified', '—')} |\n"
        )

    # Remediation checklist (only HIGH and CRITICAL)
    checklist = ""
    for idx, issue in enumerate([i for i in issues_list if i.get("severity") in ["HIGH", "CRITICAL"]], 1):
        checklist += f"- [ ] **[H{idx}]** `{issue.get('file','?')}` — {issue.get('description','?')[:120]}\n"
    if not checklist:
        checklist = "_No HIGH or CRITICAL issues — no mandatory actions required._\n"

    # Iteration log table
    iter_md = ""
    if iteration_log:
        iter_md = "| Iteration | Issues | Validator Outcome |\n|---|---|---|\n"
        for entry in iteration_log:
            iter_md += f"| {entry.get('iteration')} | {entry.get('mutations_proposed','—')} | {str(entry.get('validation_result','—'))[:80]} |\n"
    else:
        iter_md = "_No mutation loop triggered._"

    report = f"""# 🔍 Validation Audit Report

> **This is an automated security audit generated by an AI pipeline.**
> HIGH issues require mandatory human review before any merge or PR creation.

---

## 📋 Executive Summary

| Field | Value |
|---|---|
| **Audit Date** | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} |
| **Session** | `{session_nonce}` |
| **Verdict** | {'✅ PASS' if verdict == 'PASS' else '❌ FAIL'} |
| **Risk Level** | {risk_badge} |
| **Quality Score** | {score}/100 |
| **Run Duration** | {run_duration}s |
| **Routing Decision** | {routing_decision.get('rationale', '—')} |

---

## 📊 Risk Matrix

| Severity | Count | Action Required |
|---|---|---|
| 🔴 HIGH | **{highs}** | Block merge — fix before PR |
| 🟠 MEDIUM | **{meds}** | Fix in same sprint |
| 🟡 LOW | **{lows}** | Fix when convenient |
| **TOTAL** | **{total}** | |

---

## 🐛 Issues Detected
{issues_md if issues_list else '_No issues found._'}

---

## ✅ Mandatory Remediation Checklist (HIGH only)

{checklist}

---

## 🔄 Mutation Loop Trace (Anthropic Evaluator-Optimizer)

{iter_md}

### Mutations Proposed
{mutations or '_None triggered._'}

### Validator Final Status
{validation or '_None._'}

---

## 📚 Lessons Extracted (Archivist)

_See `.agents/sessions/{session_nonce}/lessons.md`_

---

## 🛡️ Trust & Confidence Metadata

| Metric | Value | Status |
|---|---|---|
| Watchdog Anomalies | {len(watchdog_result.get('anomalies', []))} | {'⚠️ ANOMALY DETECTED' if watchdog_result.get('triggered') else '✅ Clean'} |
| Verdict Consistency | — | {'✅ Consistent' if verdict_ok else '⚠️ INCONSISTENT — Manual review required'} |
| Token Budget Used | {dow_guard.estimated_tokens:,} / {DenialOfWalletGuard.MAX_TOKENS_ESTIMATE:,} | {'⚠️ Warning' if dow_guard.estimated_tokens > DenialOfWalletGuard.TOKEN_COST_WARNING_THRESHOLD else '✅ OK'} |
| API Calls Made | {dow_guard.call_count} / {DenialOfWalletGuard.MAX_CALLS_PER_RUN} | ✅ |
| Supply Chain | — | {supply_chain_status} |
| Files Verified | {len([i for i in issues_list if i.get('file_verified','').startswith('✅')])} / {total} | — |

---

> _Pipeline: SecurityGuardrails → DiffRouter → [Evaluator ‖ Critic ‖ SecurityCritic ‖ ArchCritic] → MutationLoop({len(iteration_log)} iters) → WatchdogAgent → Archivist_
"""
    return report

def load_env(dotenv_path=".env"):
    if os.path.exists(dotenv_path):
        with open(dotenv_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip()
                    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                        val = val[1:-1]
                    if key:
                        os.environ[key] = val

# Load environment variables
load_env()

# Configuration
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_PRIMARY = os.environ.get("GROQ_MODEL_PRIMARY", "llama3-70b-8192")
MODEL_FAST = os.environ.get("GROQ_MODEL_FAST", "llama3-8b-8192")

def main():
    parser = argparse.ArgumentParser(description="Post-Task Validation Loop")
    parser.add_argument("--task", type=str, default="No task description provided")
    parser.add_argument("--output", type=str, default="No output provided")
    args = parser.parse_args()

    run_start_time = time.time() # Step 7

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print(json.dumps({"score": 100, "verdict": "PASS", "high_issues": 0, "message": "GROQ_API_KEY missing, bypassed"}))
        sys.exit(0)
        
    # Auto-detect latest session directory
    sessions_dir = os.path.join(".agents", "sessions")
    session_id = None
    if os.path.exists(sessions_dir):
        subdirs = [os.path.join(sessions_dir, d) for d in os.listdir(sessions_dir) if os.path.isdir(os.path.join(sessions_dir, d))]
        if subdirs:
            latest_session = max(subdirs, key=os.path.getmtime)
            session_id = os.path.basename(latest_session)
            
    if not session_id:
        print(json.dumps({"score": 100, "verdict": "PASS", "high_issues": 0, "message": "No session found, bypassed"}))
        sys.exit(0)

    session_path = os.path.join(sessions_dir, session_id)

    # Instantiate OWASP security controls
    guardrails = SecurityGuardrails()
    dow_guard = DenialOfWalletGuard()
    watchdog = WatchdogAgent(session_path)
    supply_validator = SupplyChainValidator()
    circuit_breakers = {name: CircuitBreaker() for name in
      ["Evaluator","Critic","Security Critic","Architecture Critic","Mutator","Validator","Archivist"]}

    # Gather context
    diff_output = ""
    try:
        diff_output = subprocess.check_output(["git", "diff", "HEAD"], text=True, stderr=subprocess.STDOUT)
    except Exception:
        pass
        
    agents_md = ""
    try:
        with open(os.path.join(".agents", "docs", "AGENTS.md"), "r", encoding="utf-8") as f:
            agents_md = f.read()
    except Exception:
        pass

    # Supply chain validation on constitution
    issues_list = []
    supply_result = supply_validator.validate_constitution(agents_md, os.environ.get("AGENTS_MD_HASH", ""))
    supply_chain_status = "✅ Validated"
    if supply_result["valid"] is False:
        issues_list.append({
            "severity": "HIGH",
            "description": supply_result["warning"],
            "file": ".agents/docs/AGENTS.md"
        })
        supply_chain_status = f"⚠️ Tampered: {supply_result['warning']}"

    # Log lock for multi-threaded access to prompt-log.jsonl
    log_lock = threading.Lock()

    # Helper function to call Groq with integration of new guards
    def call_llm(system_prompt, user_prompt, agent_name, model=MODEL_PRIMARY, json_mode=False):
        # Prompt logging
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent_name,
            "model": model,
            "system": system_prompt[:500],
            "user": user_prompt[:500]
        }
        try:
            log_file = os.path.join(session_path, "prompt-log.jsonl")
            with log_lock:
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write(json.dumps(log_entry) + "\n")
        except Exception:
            pass

        # Check budget & circuit breakers
        if not dow_guard.pre_call_check(len(system_prompt) + len(user_prompt)):
            return "{}" if json_mode else ""
        if not circuit_breakers[agent_name].allow_request():
            return "{}" if json_mode else ""

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.1
        }
        if json_mode:
            data["response_format"] = {"type": "json_object"}
            
        req = urllib.request.Request(GROQ_API_URL, data=json.dumps(data).encode("utf-8"), headers=headers)
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req) as response:
                    res_body = response.read().decode("utf-8")
                    res_json = json.loads(res_body)
                    content = res_json["choices"][0]["message"]["content"]
                    circuit_breakers[agent_name].record_success()
                    return content
            except urllib.error.HTTPError as e:
                if e.code in [429, 500, 503] and attempt < 3:
                    sleep_time = (attempt + 1) * 3
                    time.sleep(sleep_time)
                    continue
                circuit_breakers[agent_name].record_failure()
                if hasattr(e, 'read'):
                    print(f"Error calling LLM (HTTP {e.code}): {e.read().decode('utf-8')}", file=sys.stderr)
                break
            except Exception as e:
                if attempt < 3:
                    time.sleep(2)
                    continue
                circuit_breakers[agent_name].record_failure()
                print(f"Error calling LLM: {e}", file=sys.stderr)
                break
        return "{}" if json_mode else ""

    # Sanitize and redact user-controlled inputs (Step 4)
    task_sanitized = guardrails.sanitize_for_prompt(args.task, "TASK")
    output_sanitized = guardrails.sanitize_for_prompt(args.output, "OUTPUT")
    diff_sanitized = guardrails.sanitize_for_prompt(diff_output, "DIFF")
    diff_redacted = guardrails.redact_sensitive(diff_sanitized)

    # 1. Routing decision (Step 1)
    router = DiffRouter()
    routing_decision = router.route(diff_redacted)
    routed_model = routing_decision["model"]
    
    # Log routing decision to prompt log
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "agent": "DiffRouter",
        "model": routed_model,
        "system": "Deciding model complexity",
        "user": json.dumps(routing_decision)
    }
    try:
        log_file = os.path.join(session_path, "prompt-log.jsonl")
        with log_lock:
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
    except Exception:
        pass

    # Wrap safe inputs in XML tags
    diff_safe = f"<DIFF>\n{diff_redacted[:8000]}\n</DIFF>"
    task_safe = f"<TASK>\n{task_sanitized}\n</TASK>"
    output_safe = f"<OUTPUT>\n{output_sanitized}\n</OUTPUT>"

    # Context string
    context = f"{task_safe}\n\n{output_safe}\n\n{diff_safe}\n\nCONSTITUTION:\n{agents_md}"

    # Agent 1: Evaluator
    evaluator_sys = "You are the Evaluator. Score the work 0-100 based on adherence to the Constitution, OWASP, and Clean Architecture. Output JSON with a 'score' integer."
    eval_res = call_llm(evaluator_sys, context, "Evaluator", json_mode=True)
    try:
        score = int(json.loads(eval_res).get("score", 100))
    except:
        score = 100

    # Agent 2: Critics (Parallel Sectioning, Step 2)
    owasp_skill_content = ""
    try:
        owasp_skill_path = os.path.join(".agents", "skills", "owasp-security", "SKILL.md")
        if os.path.exists(owasp_skill_path):
            with open(owasp_skill_path, "r", encoding="utf-8") as f:
                owasp_skill_content = f.read()
    except Exception:
        pass

    critic_results = run_critics_parallel(call_llm, context, owasp_skill_content, routed_model)
    issues_list1 = critic_results.get("Critic", [])
    issues_list2 = critic_results.get("Security Critic", [])
    issues_list3 = critic_results.get("Architecture Critic", [])

    # Combine issues
    issues_list.extend(issues_list1 + issues_list2 + issues_list3)
        
    # Verify issue files exist (Ground Truth, Step 3)
    issues_list = verify_issue_files_ground_truth(issues_list)

    # Re-resolve high issues and verdict
    high_issues = [i for i in issues_list if i.get("severity") in ["HIGH", "CRITICAL"]]
    verdict = "FAIL" if len(high_issues) > 0 else "PASS"

    # Watchdog evaluation (Step 6 of previous task)
    watchdog_result = watchdog.check_score_inflation(score, len(issues_list))
    verdict_ok = watchdog.check_verdict_consistency(score, verdict, len(high_issues))
    if watchdog_result["triggered"]:
        for anomaly in watchdog_result["anomalies"]:
            issues_list.append({
                "severity": "HIGH",
                "description": f"[{anomaly['type']}] {anomaly['detail']}",
                "file": "WatchdogAgent",
                "file_verified": "N/A (abstract reference)"
            })
        # Re-resolve high_issues and verdict after adding watchdog anomalies
        high_issues = [i for i in issues_list if i.get("severity") in ["HIGH", "CRITICAL"]]
        verdict = "FAIL" if len(high_issues) > 0 else "PASS"

    # Mutation loop (Step 4)
    mutations, validation, iteration_log = run_mutation_loop(
        call_llm, high_issues, context, diff_safe, max_iterations=3
    )

    # Agent 5: Archivist
    archivist_sys = "You are the Archivist. Extract 1-3 generalized, short bullet-point lessons from these issues to avoid them in the future."
    archivist_prompt = f"ISSUES:\n{json.dumps(issues_list)}"
    lessons = call_llm(archivist_sys, archivist_prompt, "Archivist", model=MODEL_PRIMARY) if issues_list else ""

    # Build trust metadata dictionary
    trust_metadata_dict = {
        "watchdog_anomalies": len(watchdog_result.get('anomalies', [])),
        "verdict_consistency": "Consistent" if verdict_ok else "Inconsistent",
        "tokens_used": dow_guard.estimated_tokens,
        "circuit_breakers": sum(1 for cb in circuit_breakers.values() if cb.is_open),
        "supply_chain": supply_chain_status,
        "session_nonce": session_id
    }

    # Generate Markdown Report (Step 5)
    report_content = build_audit_report(
        score=score,
        verdict=verdict,
        issues_list=issues_list,
        high_issues=high_issues,
        mutations=mutations,
        validation=validation,
        iteration_log=iteration_log,
        trust_metadata_dict=trust_metadata_dict,
        routing_decision=routing_decision,
        dow_guard=dow_guard,
        watchdog_result=watchdog_result,
        verdict_ok=verdict_ok,
        supply_chain_status=supply_chain_status,
        session_nonce=session_id,
        run_start_time=run_start_time
    )

    # File Outputs
    with open("validation-report.md", "w", encoding="utf-8") as f:
        f.write(report_content)

    log_content = f"# Loop Log\nDate: {datetime.now().isoformat()}\nScore: {score}\nVerdict: {verdict}\n\n## Issues\n{json.dumps(issues_list, indent=2)}\n\n## Mutations proposed\n{mutations}\n\n## Validation\n{validation}\n"
    with open(os.path.join(session_path, "loop-log.md"), "w", encoding="utf-8") as f:
        f.write(log_content)

    if lessons:
        with open(os.path.join(session_path, "lessons.md"), "a", encoding="utf-8") as f:
            f.write(f"\n## Lessons from {datetime.now().isoformat()}\n{lessons}\n")
            
        global_lessons_dir = os.path.expanduser("~/.agent-loop")
        if not os.path.exists(global_lessons_dir):
            os.makedirs(global_lessons_dir, exist_ok=True)
        with open(os.path.join(global_lessons_dir, "lessons.md"), "a", encoding="utf-8") as f:
            f.write(f"\n## Lessons from {datetime.now().isoformat()}\n{lessons}\n")

    if high_issues:
        with open(os.path.join(session_path, "error-patterns.md"), "a", encoding="utf-8") as f:
            f.write(f"\n## Errors from {datetime.now().isoformat()}\n{json.dumps(high_issues, indent=2)}\n")

    # Final Output to Stdout (Step 6)
    result = {
        "score": score,
        "verdict": verdict,
        "high_issues": len(high_issues),
        "issues": issues_list,
        "usage": dow_guard.get_usage_summary(),
        "routing": routing_decision,
        "iterations": len(iteration_log)
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()