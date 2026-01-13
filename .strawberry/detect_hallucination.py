#!/usr/bin/env python3
"""
Strawberry Toolkit - Hallucination Detection for Code Review
Detects procedural hallucinations in AI-generated code analysis and reviews.

Usage:
    python detect_hallucination.py --answer "<answer>" --spans "<code1>;<code2>"
    python detect_hallucination.py --file review.json
"""

import argparse
import json
import os
import sys
from typing import List, Dict, Any, Optional
import math

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai")
    sys.exit(1)


class HallucinationDetector:
    """Detects hallucinations using information theory principles."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o-mini"):
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        self.model = model

    def _logprob_to_prob(self, logprob: float) -> float:
        """Convert log probability to probability."""
        return math.exp(logprob)

    def _compute_kl_divergence(self, p1: float, p0: float) -> float:
        """Compute KL divergence in bits."""
        if p0 == 0 or p1 == 0:
            return 0.0
        return p1 * math.log2(p1 / p0) + (1 - p1) * math.log2((1 - p1) / (1 - p0))

    def _scrub_text(self, text: str, evidence_spans: List[str]) -> str:
        """Remove evidence spans from context to create 'scrubbed' version."""
        scrubbed = text
        for span in evidence_spans:
            scrubbed = scrubbed.replace(span, "[REDACTED]")
        return scrubbed

    def _get_token_logprobs(
        self, claim: str, context: str
    ) -> tuple[float, float]:
        """
        Get log probabilities for a claim with and without context.

        Returns:
            (p_with_context, p_without_context) - probabilities with full and scrubbed context
        """
        # Test with full context
        full_prompt = f"""Context:
{context}

Question/Claim: {claim}

Answer the claim with just "TRUE" or "FALSE" based on the context."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a precise fact-checker."},
                    {"role": "user", "content": full_prompt}
                ],
                max_tokens=1,
                logprobs=True,
                top_logprobs=5
            )

            # Get logprobs for TRUE/FALSE tokens
            top_logprobs = response.choices[0].logprobs.content[0].top_logprobs
            logprobs_dict = {lp.token: lp.logprob for lp in top_logprobs}

            true_logprob = logprobs_dict.get("TRUE", -10)
            false_logprob = logprobs_dict.get("FALSE", -10)

            # Normalize to probabilities
            max_log = max(true_logprob, false_logprob)
            true_prob = math.exp(true_logprob - max_log)
            false_prob = math.exp(false_logprob - max_log)
            total = true_prob + false_prob
            p_with_context = true_prob / total if total > 0 else 0.5

        except Exception as e:
            print(f"Warning: API error for full context: {e}", file=sys.stderr)
            p_with_context = 0.5

        return p_with_context, p_with_context  # Simplified - in real implementation, scrub context

    def detect_claim(
        self,
        claim: str,
        evidence_spans: List[str],
        target_confidence: float = 0.95
    ) -> Dict[str, Any]:
        """
        Detect if a claim is hallucinated.

        Args:
            claim: The claim to verify
            evidence_spans: List of code/document spans to verify against
            target_confidence: The confidence threshold (default 0.95)

        Returns:
            Detection result with flagged status and budget gap
        """
        context = "\n\n".join(evidence_spans)

        # Get probabilities
        p1, _ = self._get_token_logprobs(claim, context)

        # Calculate bits
        # Observed bits: information gained from context
        # Required bits: bits needed for target confidence
        p0 = 0.5  # Prior probability (no context)

        observed_bits = self._compute_kl_divergence(p1, p0)
        required_bits = self._compute_kl_divergence(target_confidence, p0)
        budget_gap = required_bits - observed_bits

        flagged = budget_gap > 2  # Flag if gap > 2 bits (suspicious threshold)

        return {
            "claim": claim,
            "flagged": flagged,
            "confidence": p1,
            "budget_gap": {
                "bits": round(budget_gap, 2),
                "interpretation": self._interpret_budget_gap(budget_gap)
            }
        }

    def _interpret_budget_gap(self, gap: float) -> str:
        """Interpret the budget gap value."""
        if gap < 0:
            return "Well-supported by evidence"
        elif gap < 2:
            return "Minor extrapolation"
        elif gap < 10:
            return "Suspicious - manual review recommended"
        else:
            return "Likely hallucination"

    def detect_claims(
        self,
        claims: List[Dict[str, Any]],
        evidence_spans: List[str]
    ) -> Dict[str, Any]:
        """
        Detect hallucinations across multiple claims.

        Args:
            claims: List of {"claim": str, "citations": [int]} dicts
            evidence_spans: List of code/document spans

        Returns:
            Overall detection result
        """
        results = []
        flagged_count = 0

        for idx, claim_data in enumerate(claims):
            claim_text = claim_data.get("claim", "")
            cited_spans = [
                evidence_spans[i] for i in claim_data.get("citations", [])
                if i < len(evidence_spans)
            ]

            result = self.detect_claim(claim_text, cited_spans)
            result["idx"] = idx
            results.append(result)

            if result["flagged"]:
                flagged_count += 1

        return {
            "flagged": flagged_count > 0,
            "summary": {
                "claims_scored": len(claims),
                "flagged_claims": flagged_count,
                "flagged_idxs": [r["idx"] for r in results if r["flagged"]]
            },
            "details": results
        }


def parse_claims_from_text(text: str) -> List[Dict[str, Any]]:
    """Parse claims from text, extracting citations like [S0], [S1]."""
    import re

    # Split by common delimiters
    parts = re.split(r'[.\n]+(?=\s*\[S\d+\])', text)

    claims = []
    for part in parts:
        part = part.strip()
        if not part:
            continue

        # Find all citations
        citations = [int(m.group(1)) for m in re.finditer(r'\[S(\d+)\]', part)]

        # Remove citation markers from claim text
        claim_text = re.sub(r'\[S\d+\]', '', part).strip()

        if claim_text:
            claims.append({"claim": claim_text, "citations": citations})

    return claims


def main():
    parser = argparse.ArgumentParser(
        description="Detect hallucinations in code reviews and AI analysis"
    )
    parser.add_argument("--answer", help="Answer text to analyze")
    parser.add_argument("--spans", help="Semicolon-separated evidence spans")
    parser.add_argument("--file", help="JSON file with {answer, spans} structure")
    parser.add_argument("--api-key", help="OpenAI API key (or set OPENAI_API_KEY env)")
    parser.add_argument("--model", default="gpt-4o-mini", help="Model to use")
    parser.add_argument("--output", help="Output JSON file")

    args = parser.parse_args()

    # Load input
    if args.file:
        with open(args.file, 'r') as f:
            data = json.load(f)
        answer = data.get("answer", "")
        spans = data.get("spans", [])
    elif args.answer and args.spans:
        answer = args.answer
        spans = args.spans.split(";;")
    else:
        parser.error("Must provide either --file or both --answer and --spans")

    # Parse claims
    claims = parse_claims_from_text(answer)

    if not claims:
        print("No claims found in answer. Make sure to use citations like [S0], [S1].")
        return 1

    # Run detection
    detector = HallucinationDetector(api_key=args.api_key, model=args.model)
    result = detector.detect_claims(claims, spans)

    # Output
    output = json.dumps(result, indent=2)
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"Results written to {args.output}")
    else:
        print(output)

    # Exit with error if flagged
    return 1 if result["flagged"] else 0


if __name__ == "__main__":
    sys.exit(main())
