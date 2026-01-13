#!/usr/bin/env python3
"""
Code Review Hallucination Checker
Analyzes pull request changes and validates AI-generated reviews.
"""

import argparse
import json
import os
import subprocess
import sys
from typing import List, Dict, Any
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from detect_hallucination import HallucinationDetector, parse_claims_from_text


def get_pr_files(pr_number: int, repo: str = "") -> List[Dict[str, str]]:
    """Get list of changed files in a PR using git."""
    files = []

    try:
        # Get changed files compared to main branch
        result = subprocess.run(
            ["git", "diff", "--name-only", "main", "HEAD"],
            capture_output=True,
            text=True,
            check=True
        )

        for line in result.stdout.strip().split('\n'):
            if line:
                files.append({
                    "path": line,
                    "status": "modified"
                })

    except subprocess.CalledProcessError:
        # Fallback: check current changes
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            capture_output=True,
            text=True
        )

        for line in result.stdout.strip().split('\n'):
            if line:
                files.append({
                    "path": line,
                    "status": "modified"
                })

    return files


def get_file_content(file_path: str) -> str:
    """Get file content from git."""
    try:
        result = subprocess.run(
            ["git", "show", f"HEAD:{file_path}"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError:
        # File might be new, try reading directly
        try:
            with open(file_path, 'r') as f:
                return f.read()
        except FileNotFoundError:
            return ""


def extract_code_spans(files: List[Dict[str, str]], max_files: int = 5) -> List[str]:
    """Extract code spans from changed files for analysis."""
    spans = []

    for file in files[:max_files]:
        if not file["path"].endswith(('.ts', '.tsx', '.js', '.jsx')):
            continue

        content = get_file_content(file["path"])
        if content:
            # Take first 1000 chars as representative span
            span = content[:1000]
            spans.append(f"File: {file['path']}\n```{span}```")

    return spans


def generate_ai_review_summary(
    files: List[Dict[str, str]],
    api_key: str
) -> str:
    """Generate AI review summary using OpenAI."""
    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)

        file_list = "\n".join([f"- {f['path']}" for f in files[:10]])

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a code reviewer. Analyze the changes and provide a concise summary."
                },
                {
                    "role": "user",
                    "content": f"Review these changes:\n\n{file_list}\n\nProvide a brief summary of what was changed and any potential issues."
                }
            ],
            max_tokens=500
        )

        return response.choices[0].message.content or ""

    except Exception as e:
        return f"Error generating review: {e}"


def check_code_review(
    pr_number: int = None,
    api_key: str = None,
    strict: bool = False
) -> Dict[str, Any]:
    """
    Main function to check code review for hallucinations.

    Args:
        pr_number: Pull request number (optional)
        api_key: OpenAI API key
        strict: Enable strict mode

    Returns:
        Check results
    """
    api_key = api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {
            "error": "OPENAI_API_KEY not set",
            "flagged": True
        }

    # Get changed files
    files = get_pr_files(pr_number)

    if not files:
        return {
            "summary": "No files changed",
            "flagged": False,
            "files_analyzed": 0
        }

    # Extract code spans
    code_spans = extract_code_spans(files)

    if not code_spans:
        return {
            "summary": "No code files to analyze",
            "flagged": False,
            "files_analyzed": len(files)
        }

    # Generate AI review (this is what we'll check for hallucinations)
    ai_review = generate_ai_review_summary(files, api_key)

    # Check for hallucinations in the AI review
    detector = HallucinationDetector(api_key=api_key)
    claims = parse_claims_from_text(ai_review)

    result = {
        "files_analyzed": len(files),
        "code_spans_used": len(code_spans),
        "ai_review": ai_review,
        "hallucination_check": None
    }

    if claims:
        hallucination_result = detector.detect_claims(claims, code_spans)
        result["hallucination_check"] = hallucination_result
        result["flagged"] = hallucination_result["flagged"] if strict else hallucination_result["flagged"]
    else:
        result["hallucination_check"] = {"summary": "No claims to check"}
        result["flagged"] = False

    return result


def main():
    parser = argparse.ArgumentParser(
        description="Check code reviews for hallucinations"
    )
    parser.add_argument("--pr-number", type=int, help="Pull request number")
    parser.add_argument("--api-key", help="OpenAI API key")
    parser.add_argument("--strict", action="store_true", help="Enable strict mode")
    parser.add_argument("--output", help="Output JSON file")

    args = parser.parse_args()

    result = check_code_review(
        pr_number=args.pr_number,
        api_key=args.api_key,
        strict=args.strict
    )

    output = json.dumps(result, indent=2)
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
    else:
        print(output)

    return 1 if result.get("flagged") else 0


if __name__ == "__main__":
    sys.exit(main())
