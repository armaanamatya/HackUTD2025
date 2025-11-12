import unittest
import sys
from pathlib import Path
import argparse


if __name__ == '__main__':
    base_dir = Path(__file__).resolve().parent
    sys.path.insert(0, str(base_dir.parent))

    parser = argparse.ArgumentParser(description='Run backend test suite')
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase verbosity (-v for more, up to 2)')
    args = parser.parse_args()
    verbosity = 1 + min(args.verbose, 1)

    suite = unittest.defaultTestLoader.discover(str(base_dir), pattern='test_*.py')
    runner = unittest.TextTestRunner(verbosity=verbosity)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
