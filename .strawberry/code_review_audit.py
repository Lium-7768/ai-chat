#!/usr/bin/env python3
"""
代码审查幻觉检测脚本

集成 pythea 的 audit_trace_budget 功能，用于检测 AI 代码分析中的幻觉。
"""

import json
import os
import sys
from pathlib import Path

# 添加 pythea 路径
sys.path.insert(0, '/Users/aaxis/code/AAXIS/pythea/strawberry/src')

from strawberry.trace_budget import score_trace_budget
from strawberry.backend import BackendConfig
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import subprocess


@dataclass
class Span:
    sid: str
    text: str


@dataclass
class Step:
    idx: int
    claim: str
    cites: List[str]
    confidence: float


@dataclass
class Trace:
    steps: List[Step]
    spans: List[Span]


def extract_code_claims(file_path: str) -> tuple[List[Dict], List[Dict]]:
    """
    从代码文件中提取声明和证据

    Returns:
        (steps, spans) - 可以用于 audit_trace_budget 的数据
    """
    with open(file_path, 'r') as f:
        content = f.read()

    steps = []
    spans = []
    span_idx = 0

    lines = content.split('\n')

    for idx, line in enumerate(lines, 1):
        # 跳过空行和纯注释
        if not line.strip() or line.strip().startswith('//'):
            continue

        # 提取代码特征作为证据
        if 'import' in line:
            spans.append({
                "sid": f"S{span_idx}",
                "text": f"Line {idx}: {line.strip()}"
            })
            steps.append({
                "idx": len(steps),
                "claim": f"导入依赖: {line.strip()}",
                "cites": [f"S{span_idx}"],
                "confidence": 0.95
            })
            span_idx += 1

        elif 'function' in line or 'const' in line or 'let' in line or 'var' in line:
            spans.append({
                "sid": f"S{span_idx}",
                "text": f"Line {idx}: {line.strip()}"
            })
            steps.append({
                "idx": len(steps),
                "claim": f"声明: {line.strip()[:60]}...",
                "cites": [f"S{span_idx}"],
                "confidence": 0.95
            })
            span_idx += 1

        elif 'export' in line:
            spans.append({
                "sid": f"S{span_idx}",
                "text": f"Line {idx}: {line.strip()}"
            })
            steps.append({
                "idx": len(steps),
                "claim": f"导出: {line.strip()[:60]}...",
                "cites": [f"S{span_idx}"],
                "confidence": 0.95
            })
            span_idx += 1

    return steps, spans


def run_code_audit(
    file_paths: List[str],
    verifier_model: str = "openai/gpt-4o-mini",
    backend_url: Optional[str] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    对代码文件运行幻觉检测审计

    Args:
        file_paths: 要审查的文件列表
        verifier_model: 验证模型
        backend_url: 后端 API URL (如 OpenRouter)
        api_key: API 密钥

    Returns:
        审计结果字典
    """
    all_steps = []
    all_spans = []
    file_results = []

    # 收集所有文件的声明和证据
    for file_path in file_paths:
        if not os.path.exists(file_path):
            continue

        steps, spans = extract_code_claims(file_path)

        # 重新编号 spans 避免冲突
        span_offset = len(all_spans)
        span_id_map = {}

        for i, span in enumerate(spans):
            new_sid = f"S{span_offset + i}"
            span_id_map[span['sid']] = new_sid
            all_spans.append({
                "sid": new_sid,
                "text": span['text']
            })

        for step in steps:
            # 更新引用的 span ID
            new_cites = [span_id_map.get(c, c) for c in step['cites']]
            all_steps.append({
                "idx": len(all_steps),
                "claim": f"{file_path}: {step['claim']}",
                "cites": new_cites,
                "confidence": step['confidence']
            })

    if not all_steps:
        return {
            "flagged": False,
            "total_steps": 0,
            "flagged_steps": 0,
            "details": [],
            "message": "没有可审计的代码"
        }

    # 创建 trace 对象
    spans_obj = [Span(**s) for s in all_spans]
    steps_obj = [Step(**s) for s in all_steps]
    trace = Trace(steps=steps_obj, spans=spans_obj)

    # 配置后端
    cfg = BackendConfig(
        kind="openai",
        base_url=backend_url or os.environ.get("OPENAI_BASE_URL"),
        api_key=api_key or os.environ.get("OPENAI_API_KEY"),
        max_concurrency=4,
        timeout_s=30.0,
    )

    # 运行审计
    try:
        results = score_trace_budget(
            trace=trace,
            verifier_model=verifier_model,
            backend_cfg=cfg,
            default_target=0.9,
            temperature=0.0,
            top_logprobs=10,
            placeholder="[REDACTED]"
        )

        flagged_count = 0
        details = []

        for r in results:
            gap = r.budget_gap_min
            is_flagged = gap > 2.0

            if is_flagged:
                flagged_count += 1

            details.append({
                "idx": r.idx,
                "claim": r.claim,
                "cites": r.cites,
                "budget_gap": {
                    "min": gap,
                    "max": r.budget_gap_max,
                    "units": "bits"
                },
                "flagged": is_flagged,
                "status": "⚠️ 需审查" if gap > 2 else "✅ 可信" if gap < 0 else "🟡 可接受"
            })

        return {
            "flagged": flagged_count > 0,
            "total_steps": len(results),
            "flagged_steps": flagged_count,
            "details": details,
            "message": f"检测了 {len(results)} 个代码声明，{flagged_count} 个被标记"
        }

    except Exception as e:
        return {
            "flagged": True,
            "total_steps": len(all_steps),
            "flagged_steps": 0,
            "details": [],
            "error": str(e),
            "message": f"审计失败: {e}"
        }


def main():
    """主入口"""
    import argparse

    parser = argparse.ArgumentParser(description='代码审查幻觉检测')
    parser.add_argument('--files', nargs='+', required=True, help='要审查的文件列表')
    parser.add_argument('--model', default='openai/gpt-4o-mini', help='验证模型')
    parser.add_argument('--backend-url', help='后端 API URL')
    parser.add_argument('--api-key', help='API 密钥')
    parser.add_argument('--output', required=True, help='输出 JSON 文件')

    args = parser.parse_args()

    result = run_code_audit(
        file_paths=args.files,
        verifier_model=args.model,
        backend_url=args.backend_url,
        api_key=args.api_key
    )

    with open(args.output, 'w') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"✓ 审计完成，结果保存到 {args.output}")
    print(result['message'])


if __name__ == '__main__':
    main()
