#!/usr/bin/env python3
"""Sample deterministic tool for the WAT framework.

Prints a small JSON greeting. Use this as a template for tools in `tools/`.
"""
import argparse
import json

def main():
    parser = argparse.ArgumentParser(description="Sample tool")
    parser.add_argument("--name", default="world", help="Name to greet")
    args = parser.parse_args()
    out = {"greeting": f"hello {args.name}"}
    print(json.dumps(out))

if __name__ == "__main__":
    main()
